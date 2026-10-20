"""Analyzes compare-system-one replays and builds the report page.

Reads work/system-one/ (written by scripts/compare-system-one.ts) and writes
work/system-one/analysis.json and work/system-one/page.html, a pure-ASCII page
published as the private comparison artifact. The cards in
scripts/compare-system-one/cards.json are hand-checked against the 2026-10-20
runs; rewrite them before publishing a new run.

    python3 scripts/compare-system-one.py
"""
import json, math, os, statistics as st

ROOT = 'work/system-one'
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'compare-system-one')
VARIANTS = [v for v in ['A', 'A2', 'B', 'B2', 'C', 'C2'] if os.path.isdir(f'{ROOT}/runs/{v}')]
PRICE = {'jev': 0.042, 'clef': 0.24, 'clairic': 0.10}  # USD per million input tokens

users = {u['slug']: u for u in json.load(open(f'{ROOT}/featured.json'))}
refs = json.load(open('eval/benchmark/references.json'))['personas']
public = json.load(open(f'{ROOT}/public-pdoom.json'))  # catalog id -> statement


def logit(p):
    p = min(1 - 2e-4, max(2e-4, p))
    return math.log(p / (1 - p))


def expit(z):
    return 1 / (1 + math.exp(-z))


def mean(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None


def consensus(cid):
    r = refs.get(cid, {})
    out = {}
    for k in ['x', 'y']:
        parts = [mean([s.get(k) for s in r[n]['samples']]) for n in ['r2', 'r3'] if n in r]
        out[k] = mean(parts)
    parts = [mean([logit(s['pdoom']) for s in r[n]['samples'] if s.get('pdoom') is not None]) for n in ['r2', 'r3'] if n in r]
    parts = [p for p in parts if p is not None]
    out['pdoom'] = expit(mean(parts)) if parts else None
    return out


def own_pdoom(result):
    pd = (result.get('experiment') or {}).get('pdoom') or None
    if not pd:
        return None
    own = pd.get('assessmentEstimate') if pd.get('source') == 'public-statement' else pd
    if not own:
        return None
    est = own.get('estimate')
    if est is None and own.get('bounds'):
        est = sum(own['bounds']) / 2
    return {'source': own.get('source'), 'token': own.get('token'), 'estimate': est, 'bounds': own.get('bounds')}


def near_level(v):
    return v is not None and min(abs(v - k / 4) for k in range(5)) < 0.03


def load(v):
    out = {}
    d = f'{ROOT}/runs/{v}'
    for f in os.listdir(d):
        if f.endswith('.json') and not f.endswith('.error.json'):
            j = json.load(open(f'{d}/{f}'))
            out[j['slug']] = j
    errors = [f[:-11] for f in os.listdir(d) if f.endswith('.error.json')]
    return out, errors


def critical_path(step):
    s = {x['name']: x for x in step['stages']}
    t = 0
    for name, x in s.items():
        if name in ('A: interpret', 'C: route', 'C: clarify tension', 'D: result evidence'):
            t += x['elapsedMs']
    t += max([s[n]['elapsedMs'] for n in ('D: projection', 'D: map placement', 'D: extraction') if n in s] or [0])
    return t


def quote_set(result):
    e = result.get('experiment') or {}
    items = {}
    for m in e.get('milestones', []):
        items[f"milestone:{m['id']}"] = m['evidence']['text']
    for h in e.get('hinges', []):
        items[f"hinge:{h['id']}"] = h['evidence']['text']
    for k, q in (e.get('axisEvidence') or {}).items():
        if q:
            items[f'axis:{k}'] = q['text']
    pd = e.get('pdoom') or {}
    if pd.get('text'):
        items['pdoom'] = pd['text']
    return items


runs = {}
errors = {}
for v in VARIANTS:
    runs[v], errors[v] = load(v)

base = runs['A']
summary = {}
per_user = {}
for slug, u in users.items():
    cid = u['id']
    c = consensus(cid)
    pub = public.get(cid)
    per_user[slug] = {'name': u['name'], 'id': cid, 'ref': c, 'public': pub, 'answers': len(u['transcript']),
                      'prod': {'x': u['result']['horizontal']['value'], 'y': (u['result'].get('experiment') or {}).get('transformation', {}).get('value')},
                      'variants': {}}
    for v in VARIANTS:
        j = runs[v].get(slug)
        if not j:
            continue
        r = j['result']
        e = r.get('experiment') or {}
        ex = (e.get('extraction') or {}).get('answers') or {}
        steps = j['steps']
        comp = {c_['vector']: c_['value'] for c_ in r['components']}
        per_user[slug]['variants'][v] = {
            'x': r['horizontal']['value'],
            'y': e.get('transformation', {}).get('value'),
            'xRange': r['horizontal'].get('range'),
            'yRange': e.get('transformation', {}).get('range'),
            'influence': e.get('influence', {}).get('value'),
            'pdoom': own_pdoom(r),
            'components': comp,
            'findings': sorted(f['id'] for f in r.get('findings', [])),
            'milestones': [{'id': m['id'], 'year': m.get('year'), 'text': m['evidence']['text'][:240], 'answer': m['evidence']['answerNumber']} for m in e.get('milestones', [])],
            'hinges': [{'id': h['id'], 'text': h['evidence']['text'][:240], 'answer': h['evidence']['answerNumber']} for h in e.get('hinges', [])],
            'quotes': quote_set(r),
            'clairicMap': {'x': (ex.get('map_outlook') or {}).get('median'), 'y': (ex.get('map_transformation') or {}).get('median')} if ex else None,
            'clairicPdoom': ({k: ex['pdoom_estimate'].get(k) for k in ['median', 'p10', 'p90']} if ex.get('pdoom_estimate') else None),
            'clairicStated': ({'value': ex['pdoom_stated_value'].get('value'), 'p_null': ex['pdoom_stated_value'].get('p_null')} if ex.get('pdoom_stated_value') else None),
            'routing': [s_['nextPromptId'] for s_ in steps],
            'ready': [s_['ready'] for s_ in steps],
            'firstReady': j['firstReadyAnswer'],
            'latency': [critical_path(s_) for s_ in steps],
            'stageMs': {name: st.median([x['elapsedMs'] for s_ in steps for x in s_['stages'] if x['name'] == name]) for name in {x['name'] for s_ in steps for x in s_['stages']}},
            'tokens': j['tokens'],
            'usd': sum(PRICE[k] * n / 1e6 for k, n in j['tokens'].items()),
            'wallMs': j['wallMs'],
        }


def pair_stats(v, w='A'):
    dx, dy, dp, comp, route_same, route_n, findings_same, quote_same, quote_n = [], [], [], [], 0, 0, 0, 0, 0
    ready_same = ready_n = 0
    for slug, pu in per_user.items():
        a, b = pu['variants'].get(w), pu['variants'].get(v)
        if not a or not b:
            continue
        if a['x'] is not None and b['x'] is not None:
            dx.append(abs(a['x'] - b['x']))
        if a['y'] is not None and b['y'] is not None:
            dy.append(abs(a['y'] - b['y']))
        if a['pdoom'] and b['pdoom'] and a['pdoom']['estimate'] is not None and b['pdoom']['estimate'] is not None:
            dp.append(abs(logit(a['pdoom']['estimate']) - logit(b['pdoom']['estimate'])))
        for k, va in a['components'].items():
            vb = b['components'].get(k)
            if va is not None and vb is not None:
                comp.append(abs(va - vb))
        for ra, rb in zip(a['routing'][:-1], b['routing'][:-1]):
            route_n += 1
            route_same += ra == rb
        findings_same += a['findings'] == b['findings']
        ready_n += 1
        ready_same += a['firstReady'] == b['firstReady']
        for k, t in a['quotes'].items():
            if k in b['quotes']:
                quote_n += 1
                quote_same += t in b['quotes'][k] or b['quotes'][k] in t
    n = len(dx)
    return {
        'users': n,
        'meanDx': mean(dx), 'meanDy': mean(dy), 'maxDx': max(dx) if dx else None, 'maxDy': max(dy) if dy else None,
        'moved10': sum(1 for a, b in zip(dx, dy) if max(a, b) > 0.1),
        'meanDpLogodds': mean(dp), 'pdoom2x': sum(1 for x in dp if x > 0.7),
        'meanDcomponent': mean(comp),
        'routeAgreement': route_same / route_n if route_n else None, 'routeSteps': route_n,
        'findingsIdentical': findings_same,
        'quoteAgreement': quote_same / quote_n if quote_n else None,
        'readySame': ready_same, 'readyN': ready_n,
    }


def accuracy(v):
    ex, ey, ep, epub, near_x, near_y, n, cx, cy = [], [], [], [], 0, 0, 0, [], []
    stated = 0
    timeline_years = 0
    milestones = hinges = 0
    for slug, pu in per_user.items():
        b = pu['variants'].get(v)
        if not b:
            continue
        n += 1
        ref = pu['ref']
        if b['x'] is not None and ref['x'] is not None:
            ex.append(abs(b['x'] - ref['x']))
        if b['y'] is not None and ref['y'] is not None:
            ey.append(abs(b['y'] - ref['y']))
        near_x += near_level(b['x'])
        near_y += near_level(b['y'])
        p = b['pdoom']
        if p and p['estimate'] is not None and ref['pdoom'] is not None:
            ep.append(abs(logit(p['estimate']) - logit(ref['pdoom'])))
        if p and p['estimate'] is not None and pu['public']:
            # Benchmark R4 rule: zero inside the stated range, else distance to its nearest end.
            lo, hi = pu['public']['bounds']
            z = logit(p['estimate'])
            epub.append(0 if lo <= p['estimate'] <= hi else min(abs(z - logit(lo)), abs(z - logit(hi))))
        if p and p['source'] == 'stated':
            stated += 1
        if b['clairicMap'] and b['clairicMap']['x'] is not None and ref['x'] is not None:
            cx.append(abs(b['clairicMap']['x'] - ref['x']))
            cy.append(abs(b['clairicMap']['y'] - ref['y']))
        milestones += len(b['milestones'])
        hinges += len(b['hinges'])
        timeline_years += sum(1 for m in b['milestones'] if m['year'])
    lat = [x for pu in per_user.values() if v in pu['variants'] for x in pu['variants'][v]['latency']]
    usd = [pu['variants'][v]['usd'] for pu in per_user.values() if v in pu['variants']]
    answers = sum(pu['answers'] for pu in per_user.values() if v in pu['variants'])
    stage_names = sorted({k for pu in per_user.values() if v in pu['variants'] for k in pu['variants'][v]['stageMs']})
    return {
        'users': n, 'errors': errors.get(v, []),
        'refErrX': mean(ex), 'refErrY': mean(ey),
        'clairicMapErrX': mean(cx), 'clairicMapErrY': mean(cy),
        'nearLevelX': near_x / n if n else None, 'nearLevelY': near_y / n if n else None,
        'pdoomRefLogodds': mean(ep), 'pdoomRefWithin2x': sum(1 for x in ep if x <= 0.7) / len(ep) if ep else None,
        'pdoomPublicLogodds': mean(epub), 'pdoomPublicWithin2x': sum(1 for x in epub if x <= 0.7), 'pdoomPublicN': len(epub),
        'stated': stated, 'milestones': milestones, 'hinges': hinges, 'timelineYears': timeline_years,
        'latencyMedianMs': st.median(lat) if lat else None, 'latencyP90Ms': sorted(lat)[int(0.9 * (len(lat) - 1))] if lat else None,
        'stageMedianMs': {k: st.median([pu['variants'][v]['stageMs'][k] for pu in per_user.values() if v in pu['variants'] and k in pu['variants'][v]['stageMs']]) for k in stage_names},
        'usdPerUser': mean(usd), 'usdTotal': sum(usd), 'usdPerAnswer': sum(usd) / answers if answers else None,
    }


for v in VARIANTS:
    summary[v] = {'accuracy': accuracy(v), 'vsA': pair_stats(v) if v != 'A' else None}
if 'C2' in VARIANTS:
    summary['C2']['vsC'] = pair_stats('C2', 'C')

json.dump({'variants': VARIANTS, 'summary': summary, 'users': per_user}, open(f'{ROOT}/analysis.json', 'w'), indent=1)
for v in VARIANTS:
    a = summary[v]['accuracy']
    print(v, json.dumps({k: (round(x, 3) if isinstance(x, float) else x) for k, x in a.items() if k != 'stageMedianMs'}))
    print('   stages', {k: round(x) for k, x in a['stageMedianMs'].items()})
    if summary[v]['vsA']:
        print('   vsA', json.dumps({k: (round(x, 3) if isinstance(x, float) else x) for k, x in summary[v]['vsA'].items()}))


# ---- Report page
an = json.load(open(f'{ROOT}/analysis.json'))
rows = json.load(open(f'{ROOT}/estimator-designs.json'))
S = an['summary']
U = an['users']


def L(p):
    p = min(1 - 2e-4, max(2e-4, p))
    return math.log(p / (1 - p))


def spearman(a, b):
    def rank(x):
        order = sorted(range(len(x)), key=lambda i: x[i])
        r = [0] * len(x)
        for j, i in enumerate(order):
            r[i] = j
        return r
    ra, rb = rank(a), rank(b)
    n = len(a)
    return 1 - 6 * sum((x - y) ** 2 for x, y in zip(ra, rb)) / (n * (n * n - 1))


# Inferred P(doom) estimators against the reference consensus.
est = {}
names = {
    'jev_A': 'Jev likelihood bands (today)',
    'linear_guided': 'Clairic, 0-100% with wording guide',
    'linear_0_100': 'Clairic, 0-100%',
    'log_guided': 'Clairic, log scale with wording guide',
    'log_001_100': 'Clairic, log scale',
    'constant': 'Same 12.5% for everyone',
}
for r in rows:
    u = U[r['slug']]
    ref = u['ref']['pdoom']
    a = u['variants']['A']['pdoom']
    for k, v in r['answers'].items():
        if k not in names:
            continue
        est.setdefault(k, []).append((v['median'] / 100, ref))
    est.setdefault('jev_A', []).append((a['estimate'], ref))
    est.setdefault('constant', []).append((0.125, ref))
estimators = []
for k, label in names.items():
    pairs = est[k]
    errs = [abs(L(p) - L(r)) for p, r in pairs]
    estimators.append({
        'id': k, 'label': label,
        'within2x': sum(1 for e in errs if e <= 0.7) / len(errs),
        'error': st.mean(errs),
        'rank': spearman([p for p, _ in pairs], [r for _, r in pairs]) if k != 'constant' else None,
        'median': st.median([p for p, _ in pairs]),
    })

users = []
for slug, u in U.items():
    v = u['variants']
    if not all(k in v for k in ['A', 'B2', 'C']):
        continue
    def pt(k):
        p = v[k]['pdoom']
        return {
            'x': v[k]['x'], 'y': v[k]['y'],
            'p': p['estimate'] if p else None,
            'ps': p['source'] if p else None,
            'pt': p['token'] if p else None,
            'ms': [[m['id'], m['year']] for m in v[k]['milestones']],
            'r': v[k]['routing'],
        }
    users.append({
        'slug': slug, 'name': u['name'],
        'ref': u['ref'], 'pub': u['public'],
        # The page's middle column is the complement design (run B2).
        'A': pt('A'), 'B': pt('B2'), 'C': pt('C'),
        'A2': pt('A2') if 'A2' in v else None,
        'cm': v['B2'].get('clairicMap'),
    })

summary = {'A': S['A'], 'A2': S['A2'], 'B': S['B2'], 'C': S['C'], 'Bq': S['B']}
data = {'summary': summary, 'users': users, 'estimators': estimators}
blob = json.dumps(data, separators=(',', ':'), ensure_ascii=True)
import re
# Placeholders survive the repository formatter, which spaces them out.
fill = lambda text, name, value: re.sub(r'/\*' + name + r'\*/\s*(null|\[\])', lambda _: value, text)
html = fill(open(f'{HERE}/page.html').read(), 'DATA', blob)


def ascii(s):
    # Entities in markup, \uXXXX escapes inside scripts (artifact pages may be
    # decoded as Windows-1252, so the file must be pure ASCII).
    out, in_script, i = [], False, 0
    while i < len(s):
        if s.startswith('<script', i):
            in_script = True
        elif s.startswith('</script>', i):
            in_script = False
        ch = s[i]
        if ord(ch) < 128:
            out.append(ch)
        elif in_script:
            out.append(''.join(f'\\u{u:04x}' for u in [ord(ch)]) if ord(ch) < 0x10000 else ch.encode('utf-16-be').hex())
        else:
            out.append(f'&#{ord(ch)};')
        i += 1
    return ''.join(out)


html = ascii(html)
assert all(ord(c) < 128 for c in html)
open(f'{ROOT}/page.html', 'w').write(html)
print('users', len(users), 'bytes', len(html))
for e in estimators:
    print(e['label'], round(e['within2x'], 2), round(e['error'], 2), e['rank'] and round(e['rank'], 2))

# ---- Hand-written cards and recommendations (numbers checked against the runs)
cards = json.load(open(f'{HERE}/cards.json'))
html = open(f'{ROOT}/page.html').read()
html = fill(fill(html, 'CARDS', json.dumps(cards['cards'], ensure_ascii=True)), 'RECS', json.dumps(cards['recs'], ensure_ascii=True))
html = ascii(html)
assert all(ord(c) < 128 for c in html)
open(f'{ROOT}/page.html', 'w').write(html)
print('cards', len(cards['cards']), 'recs', len(cards['recs']))
