"""Aggregates participant results for the blog's data posts (docs/BLOG.md).

Reads pseudonymized rows from stdin, as written by
`scripts/blog-participant-data.ts`, and writes one JSON file of aggregates to
the path given as the first argument. Rows never touch the disk. Only
aggregates leave this script, and every published count, share or statistic
describes at least 10 people; smaller groups are reported as null or "<10".

Run through `pnpm blog:data`, which supplies the rows:
  uv run --with numpy --with scipy python scripts/blog-participant-data.py <out.json>
"""
import collections as C
import json
import math
import sys

import numpy as np
from scipy import stats
from scipy.cluster.vq import kmeans2

MIN_N = 10
BOOTSTRAP = 10_000
rng = np.random.default_rng(20261001)

data = json.load(sys.stdin)
ALL = data['participants']
PERSONAS = data['personas']
FEEDBACK = data['feedback']
AS_OF = data['extractedAt'][:10]
LAUNCH = '2026-09-25'

# ── Population ────────────────────────────────────────────────────────────
# Simulated users are never in `participants`. The site owner's own account
# (launch testing) and forks (a fork copies its source's answers) are left out,
# and each owner counts once: their earliest assessment that reached a result,
# or their earliest assessment when none did.
excluded_owner = [p for p in ALL if p['isOwner']]
excluded_forks = [p for p in ALL if not p['isOwner'] and p['isFork']]
REAL = [p for p in ALL if not p['isOwner'] and not p['isFork']]
by_owner = C.defaultdict(list)
for p in REAL:
    by_owner[p['owner']].append(p)
PEOPLE = []
for rows in by_owner.values():
    rows.sort(key=lambda p: p['i'])
    done = [p for p in rows if p['hasResult']]
    PEOPLE.append(done[0] if done else rows[0])
PEOPLE.sort(key=lambda p: p['i'])
WITH_RESULT = [p for p in PEOPLE if p['hasResult']]


def wave(p):
    if p['day'] < LAUNCH:
        return 'prelaunch'
    if p['day'] <= '2026-09-26':
        return 'hn'
    if p['day'] <= '2026-09-28':
        return 'x'
    return 'later'


def x_of(p):
    return p['x'] if p.get('x') is not None and not p.get('insufficient') else None


def y_of(p):
    return p['y'] if p.get('y') is not None and not p.get('insufficient') else None


def pdoom_of(p, source=None):
    pd = p.get('pdoom')
    if not pd or pd.get('estimate') is None or pd.get('token') == 'Unclear':
        return None
    if source and pd.get('source') != source:
        return None
    return pd['estimate']


def placed(p):
    return x_of(p) is not None and y_of(p) is not None


def feedback_for(kind):
    """The first feedback of a kind per counted assessment (its first reveal)."""
    counted = {p['i']: p for p in WITH_RESULT}
    out = {}
    for f in FEEDBACK:
        if f['kind'] != kind or f['a'] not in counted:
            continue
        if f['a'] not in out or f['evidenceRevision'] < out[f['a']][0]['evidenceRevision']:
            out[f['a']] = (f, counted[f['a']])
    return list(out.values())


# ── Statistics ────────────────────────────────────────────────────────────
def r3(v):
    return None if v is None else round(float(v), 3)


def boot_median(v):
    v = np.asarray(v, float)
    if len(v) < MIN_N:
        return None
    meds = np.median(v[rng.integers(0, len(v), (BOOTSTRAP, len(v)))], axis=1)
    return [r3(np.percentile(meds, 2.5)), r3(np.percentile(meds, 97.5))]


def boot_diff(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    ma = np.median(a[rng.integers(0, len(a), (BOOTSTRAP, len(a)))], axis=1)
    mb = np.median(b[rng.integers(0, len(b), (BOOTSTRAP, len(b)))], axis=1)
    d = mb - ma
    return [r3(np.percentile(d, 2.5)), r3(np.percentile(d, 97.5))]


def perm_median(a, b, n=5000):
    a, b = np.asarray(a, float), np.asarray(b, float)
    obs = abs(np.median(b) - np.median(a))
    pool = np.concatenate([a, b])
    hits = 0
    for _ in range(n):
        rng.shuffle(pool)
        if abs(np.median(pool[len(a):]) - np.median(pool[:len(a)])) >= obs - 1e-12:
            hits += 1
    return (hits + 1) / (n + 1)


def median_of(v):
    """A median with its bootstrap interval, or null under the minimum."""
    v = [x for x in v if x is not None]
    if len(v) < MIN_N:
        return {'n': None, 'median': None, 'median_ci95': None, 'note': '<10'}
    return {'n': len(v), 'median': r3(np.median(v)), 'median_ci95': boot_median(v)}


def compare(a, b, label):
    """b relative to a: Mann–Whitney U, P(b > a), rank-biserial, median gap."""
    a, b = [v for v in a if v is not None], [v for v in b if v is not None]
    if len(a) < MIN_N or len(b) < MIN_N:
        return {'measure': label, 'nA': None, 'nB': None, 'note': '<10'}
    u = stats.mannwhitneyu(b, a, alternative='two-sided')
    ps = u.statistic / (len(a) * len(b))
    return {'measure': label, 'nA': len(a), 'nB': len(b),
            'medianA': r3(np.median(a)), 'medianA_ci95': boot_median(a),
            'medianB': r3(np.median(b)), 'medianB_ci95': boot_median(b),
            'medianDiff': r3(np.median(b) - np.median(a)), 'medianDiff_ci95': boot_diff(a, b),
            'mannWhitneyU': float(u.statistic), 'mannWhitneyP': float(u.pvalue),
            'probabilityOfSuperiority': r3(ps), 'rankBiserial': r3(2 * ps - 1),
            'permutationP_medianDiff': perm_median(a, b)}


def sup(k):
    return k if k >= MIN_N else '<10'


def wilson(k, n):
    if n == 0:
        return [None, None]
    z = 1.96
    p = k / n
    den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [r3(c - h), r3(c + h)]


def share(k, n):
    if k < MIN_N or n < MIN_N:
        # A denominator under the minimum is itself a small group: hide it too.
        return {'n': n if n >= MIN_N else None, 'count': None, 'share': None, 'ci95': [None, None], 'note': '<10'}
    return {'n': n, 'count': k, 'share': r3(k / n), 'ci95': wilson(k, n)}


OUTLOOK_BANDS = [('catastrophe', 0, .125), ('mainly harm', .125, .375), ('mixed', .375, .625),
                 ('leans hopeful', .625, .875), ('enthusiastic', .875, 1.0001)]
PD_BANDS = [('under 2%', 0, .02), ('2–10%', .02, .10), ('10–30%', .10, .30), ('30% or more', .30, 1.0001)]


def band_of(x):
    return next(name for name, lo, hi in OUTLOOK_BANDS if lo <= x < hi)


# Since algorithm 0.7.5 the map places people between and within the five
# outlook levels, so a level is the reading itself (the description shown),
# not a slice of the axis. Older results sat on their level, so both agree there.
LEVEL_NAMES = [name for name, _, _ in OUTLOOK_BANDS]


def levels_of(g):
    return [p['outlookLevel'] for p in g if x_of(p) is not None and p.get('outlookLevel') is not None]


def pd_band(v):
    return next(name for name, lo, hi in PD_BANDS if lo <= v < hi)


def side(x):
    return 'doom side (x<0.4)' if x < .4 else 'middle (0.4–0.6)' if x <= .6 else 'bloom side (x>0.6)'


SIDES = ['doom side (x<0.4)', 'middle (0.4–0.6)', 'bloom side (x>0.6)']


def xs_of(g):
    return [x_of(p) for p in g if x_of(p) is not None]


def ys_of(g):
    return [y_of(p) for p in g if y_of(p) is not None]


def regions(g):
    xs = xs_of(g)
    return [sum(1 for x in xs if x < .4), sum(1 for x in xs if .4 <= x <= .6), sum(1 for x in xs if x > .6)]


# ── 1. Volume ─────────────────────────────────────────────────────────────
started = C.Counter(p['day'] for p in PEOPLE)
completed = C.Counter(p['firstResultDay'] for p in WITH_RESULT)
launch_days = ['2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28']
by_day = [{'day': d, 'started': sup(started[d]), 'completed': sup(completed[d])} for d in launch_days]
tail_started = sum(v for d, v in started.items() if d > launch_days[-1])
tail_completed = sum(v for d, v in completed.items() if d and d > launch_days[-1])
by_day.append({'day': f'2026-09-29 to {AS_OF}', 'started': sup(tail_started), 'completed': sup(tail_completed)})
by_wave_rate = {}
for w in ['hn', 'x', 'later']:
    g = [p for p in PEOPLE if wave(p) == w]
    k = sum(1 for p in g if p['hasResult'])
    by_wave_rate[w] = {'started': sup(len(g)), **share(k, len(g))}
volume = {
    'description': 'People who started and finished. Started: an owner whose counted assessment was created that UTC day. Finished: that person reached a result, counted on the day of their first result.',
    'n': len(PEOPLE),
    'funnel': {'participantAssessments': len(ALL), 'excludedOwnerTestAccount': sup(len(excluded_owner)),
               'excludedForks': sup(len(excluded_forks)), 'excludedRepeatAssessmentsBySameOwner': sup(len(REAL) - len(PEOPLE)),
               'people': len(PEOPLE), 'peopleWithResult': len(WITH_RESULT)},
    'byDay': by_day,
    'completion': share(len(WITH_RESULT), len(PEOPLE)),
    'completionByWave': by_wave_rate,
}

# ── 2. Waves ──────────────────────────────────────────────────────────────
G = {w: [p for p in WITH_RESULT if wave(p) == w] for w in ['hn', 'x', 'later']}


def summary(g):
    xs, ys = xs_of(g), ys_of(g)
    pd_all = [pdoom_of(p) for p in g if pdoom_of(p) is not None]
    pd_inf = [pdoom_of(p, 'inferred') for p in g if pdoom_of(p, 'inferred') is not None]
    pd_st = [pdoom_of(p, 'stated') for p in g if pdoom_of(p, 'stated') is not None]
    bands = C.Counter(LEVEL_NAMES[level] for level in levels_of(g))
    ranges = C.Counter(band_of(x) for x in xs)
    words = [float(np.median(p['words'])) for p in g if p['words']]
    return {
        'peopleWithResult': len(g),
        'outlook': {**median_of(xs), 'doomSide_x_below_0_4': share(regions(g)[0], len(xs)),
                    'middle_0_4_to_0_6': share(regions(g)[1], len(xs)),
                    'bloomSide_x_above_0_6': share(regions(g)[2], len(xs)),
                    'byOutlookBand': {name: share(bands[name], len(levels_of(g))) for name in LEVEL_NAMES},
                    'byOutlookRange': {name: share(ranges[name], len(xs)) for name in LEVEL_NAMES}},
        'scale': {**median_of(ys), 'top_0_9_or_more': share(sum(1 for y in ys if y >= .9), len(ys))},
        'pdoomShown': median_of(pd_all),
        'pdoomInferred': {**median_of(pd_inf),
                          'byBand': {name: share(sum(1 for v in pd_inf if pd_band(v) == name), len(pd_inf)) for name, _, _ in PD_BANDS}},
        'pdoomTyped': median_of(pd_st),
        'interview': {'medianWordsPerAnswer': r3(np.median(words)) if len(words) >= MIN_N else None,
                      'medianAnswers': r3(np.median([p['answers'] for p in g])) if len(g) >= MIN_N else None,
                      'askedDirectScaleQuestion': share(sum(1 for p in g if 'transformation.ultimate' in p['promptIds']), len(g)),
                      'askedDirectPdoomQuestion': share(sum(1 for p in g if 'risk.chance' in p['promptIds']), len(g))},
    }


def fisher(a, b, test, label):
    ka, na = sum(1 for v in a if test(v)), len(a)
    kb, nb = sum(1 for v in b if test(v)), len(b)
    res = stats.fisher_exact([[ka, na - ka], [kb, nb - kb]])
    return {'measure': label, 'hn': share(ka, na), 'x': share(kb, nb), 'fisherP': float(res.pvalue)}


hx, xx = xs_of(G['hn']), xs_of(G['x'])
hp = [pdoom_of(p) for p in G['hn'] if pdoom_of(p) is not None]
xp = [pdoom_of(p) for p in G['x'] if pdoom_of(p) is not None]
chi = stats.chi2_contingency([regions(G['hn']), regions(G['x'])])
tests = {
    'outlook': compare(hx, xx, 'outlook x (0 doom, 1 bloom)'),
    'scale': compare(ys_of(G['hn']), ys_of(G['x']), 'scale y (0 incremental, 1 civilizational)'),
    'pdoomShown': compare(hp, xp, 'shown P(doom)'),
    'regions_chi2': {'chi2': r3(chi.statistic), 'dof': int(chi.dof), 'p': float(chi.pvalue),
                     'cramersV': r3(math.sqrt(chi.statistic / (len(hx) + len(xx))))},
    'catastropheBand': fisher(levels_of(G['hn']), levels_of(G['x']), lambda v: v == 0, 'outlook level reads "catastrophe"'),
    'mainlyHarmBand': fisher(levels_of(G['hn']), levels_of(G['x']), lambda v: v == 1, 'outlook level reads "mainly expects harm"'),
    'enthusiasticBand': fisher(levels_of(G['hn']), levels_of(G['x']), lambda v: v == 4, 'outlook level reads "enthusiastic"'),
    'catastropheEnd': fisher(hx, xx, lambda v: v < .125, 'outlook position below 0.125 (the catastrophe end of the axis)'),
    'enthusiasticEnd': fisher(hx, xx, lambda v: v >= .875, 'outlook position 0.875 or more (the enthusiastic end of the axis)'),
    'pdoomShownAtLeast10': fisher(hp, xp, lambda v: v >= .1, 'shown P(doom) of 10% or more'),
    'pdoomShownAtLeast30': fisher(hp, xp, lambda v: v >= .3, 'shown P(doom) of 30% or more'),
}
# Interviews created before the 0.7.0 deploy (early afternoon UTC, Sep 27)
# asked the old questions. Splitting the X wave separates audience from questions.
x_old = [p for p in G['x'] if p['pinned'] == '0.6.1']
x_new = [p for p in G['x'] if p['pinned'] != '0.6.1']


def engine_group(g):
    return {'outlook': median_of(xs_of(g)), 'scale': median_of(ys_of(g))}


engine = {
    'hnWave_oldInterview': engine_group(G['hn']),
    'xWave_oldInterview': engine_group(x_old),
    'xWave_newInterview': engine_group(x_new),
    'tests': {'hn_vs_xOld_outlook': compare(hx, xs_of(x_old), 'outlook, same old interview'),
              'xOld_vs_xNew_outlook': compare(xs_of(x_old), xs_of(x_new), 'outlook within the X wave, old vs new interview'),
              'xOld_vs_xNew_scale': compare(ys_of(x_old), ys_of(x_new), 'scale within the X wave, old vs new interview'),
              'hn_vs_xOld_scale': compare(ys_of(G['hn']), ys_of(x_old), 'scale, same old interview')},
}


def blocks(g):
    cnt = C.Counter(p['hour'] // 6 for p in g)
    return {f'{b * 6:02d}-{b * 6 + 5:02d} UTC': share(cnt[b], len(g)) for b in range(4)}


def block_medians(g):
    return {f'{b * 6:02d}-{b * 6 + 5:02d} UTC': median_of(xs_of([p for p in g if p['hour'] // 6 == b])) for b in range(4)}


every_owner = [p for p in REAL if p['hasResult']]
waves = {
    'description': 'Hacker News wave (Sep 25–26 UTC) vs X wave (Sep 27–28 UTC), by the UTC day each counted interview was created. Waves are inferred from dates; no per-person referrer was recorded before Oct 1.',
    'n': len(G['hn']) + len(G['x']),
    'hn': {'label': 'Hacker News wave', **summary(G['hn'])},
    'x': {'label': 'X wave', **summary(G['x'])},
    'later': {'label': 'Since Sep 29', 'peopleWithResult': len(G['later']), 'outlook': median_of(xs_of(G['later']))},
    'tests': tests,
    'engineVersion': engine,
    'timeOfDay': {'hn': blocks(G['hn']), 'x': blocks(G['x'])},
    'outlookByTimeOfDay': {'hn': block_medians(G['hn']), 'x': block_medians(G['x'])},
    'sensitivity': {
        'everyAssessmentNoOwnerDedup': {'hn': median_of(xs_of([p for p in every_owner if wave(p) == 'hn'])),
                                        'x': median_of(xs_of([p for p in every_owner if wave(p) == 'x']))},
        'xWaveFromSep27Noon': median_of(xs_of([p for p in G['x'] if not (p['day'] == '2026-09-27' and p['hour'] < 12)])),
        'hnWavePeakHoursOnly': median_of(xs_of([p for p in G['hn'] if p['day'] == '2026-09-25' and p['hour'] >= 18])),
    },
}

# ── 3. Map ────────────────────────────────────────────────────────────────
PL = [p for p in WITH_RESULT if placed(p)]
pts = np.array([[x_of(p), y_of(p)] for p in PL])
edges = np.linspace(0, 1, 6)
H, _, _ = np.histogram2d(pts[:, 0], pts[:, 1], bins=[edges, edges])
cells = []
for i in range(5):
    for j in range(5):
        k = int(H[i, j])
        cells.append({'x0': r3(edges[i]), 'x1': r3(edges[i + 1]), 'y0': r3(edges[j]), 'y1': r3(edges[j + 1]),
                      'count': k if k >= MIN_N else None, 'share': r3(k / len(PL)) if k >= MIN_N else None})
SP = [p for p in PERSONAS if p['placed']]
FEAT = [p for p in SP if p['featured']]
sp_pts = np.array([[p['x'], p['y']] for p in SP])
ft_pts = np.array([[p['x'], p['y']] for p in FEAT])
dist_any = np.sqrt(((pts[:, None, :] - sp_pts[None, :, :]) ** 2).sum(-1)).min(1)
dist_feat = np.sqrt(((pts[:, None, :] - ft_pts[None, :, :]) ** 2).sum(-1)).min(1)


def logit(p):
    q = min(max(p, .001), .999)
    return math.log(q / (1 - q))


def persona_pdoom(p):
    pd = p['pdoom']
    return pd['estimate'] if pd and pd.get('estimate') is not None and pd.get('token') != 'Unclear' else None


# Five k-means groups on outlook, scale and scaled log-odds P(doom); each
# simulated profile with a P(doom) joins its nearest group.
PC = [p for p in PL if pdoom_of(p) is not None]
X = np.array([[x_of(p), y_of(p), (logit(pdoom_of(p)) + 7) / 14] for p in PC])
krng = np.random.default_rng(7)
runs = []
for _ in range(32):
    cent, lab = kmeans2(X, 5, seed=int(krng.integers(1e9)), minit='++')
    runs.append((((X - cent[lab]) ** 2).sum(), cent, lab))
_, cent, lab = min(runs, key=lambda r: r[0])
order = list(np.argsort(cent[:, 0] + 0.001 * cent[:, 1]))
SPC = [p for p in SP if persona_pdoom(p) is not None]
nearest = [int(np.argmin(((cent - np.array([p['x'], p['y'], (logit(persona_pdoom(p)) + 7) / 14])) ** 2).sum(1))) for p in SPC]
groups = []
for rank, j in enumerate(order):
    members = [PC[i] for i in range(len(PC)) if lab[i] == j]
    simulated = sum(1 for i in range(len(SPC)) if nearest[i] == j)
    groups.append({'group': rank + 1, **share(len(members), len(PC)),
                   'medianOutlook': r3(np.median(xs_of(members))), 'medianScale': r3(np.median(ys_of(members))),
                   'medianPdoom': r3(np.median([pdoom_of(p) for p in members])),
                   'simulated': simulated, 'simulatedShare': r3(simulated / len(SPC))})
# Labels describe each group: the highest P(doom) is worried, the least change
# skeptical, the gloomiest of the rest concerned, and of the last two the one
# expecting more change transformative.
worried = max(groups, key=lambda g: g['medianPdoom'])
skeptics = min((g for g in groups if g is not worried), key=lambda g: g['medianScale'])
rest = sorted((g for g in groups if g is not worried and g is not skeptics), key=lambda g: g['medianOutlook'])
pragmatic, transformative = sorted(rest[1:], key=lambda g: g['medianScale'])
for g, label in [(worried, 'Worried, catastrophe-scale stakes'), (rest[0], 'Concerned, expects big change'),
                 (skeptics, 'Skeptics: little change, somewhat negative'), (pragmatic, 'Pragmatic optimists'),
                 (transformative, 'Transformative optimists')]:
    g['label'] = label
if worried['medianPdoom'] <= .3 or skeptics['medianScale'] >= .4 or rest[0]['medianOutlook'] >= .5:
    print('Warning: the groups fit their labels loosely; review them before publishing.', file=sys.stderr)
xa, ya = pts[:, 0], pts[:, 1]
levels = np.array([0, .25, .5, .75, 1])
sim_x = np.array([p['x'] for p in SP])
horseshoe = []
for name, lo, hi in OUTLOOK_BANDS:
    m = (xa >= lo) & (xa < hi)
    pdv = [pdoom_of(p) for p, k in zip(PL, m) if k and pdoom_of(p) is not None]
    horseshoe.append({'outlookBand': name, **share(int(m.sum()), len(PL)),
                      'medianScale': r3(np.median(ya[m])) if m.sum() >= MIN_N else None,
                      'medianShownPdoom': r3(np.median(pdv)) if len(pdv) >= MIN_N else None,
                      'simulated': int(((sim_x >= lo) & (sim_x < hi)).sum())})
scale_answers = C.Counter(p['scaleAnswer'] for p in PL if p.get('scaleAnswer'))
answered = sum(scale_answers.values())
map_body = {
    'description': 'Where participants sit on the Doom–Bloom (x) × scale of change (y) map, with the simulated thought leaders. One point per person.',
    'n': len(PL),
    'overall': {'outlook': median_of(xa), 'scale': median_of(ya),
                'doomSide_x_below_0_4': share(int((xa < .4).sum()), len(xa)),
                'middle': share(int(((xa >= .4) & (xa <= .6)).sum()), len(xa)),
                'bloomSide_x_above_0_6': share(int((xa > .6).sum()), len(xa)),
                'lowerHalf_y_below_0_5': share(int((ya < .5).sum()), len(ya)),
                'upperHalf_y_0_5_to_0_9': share(int(((ya >= .5) & (ya < .9)).sum()), len(ya)),
                'topEdge_y_0_9_or_more': share(int((ya >= .9).sum()), len(ya)),
                'expectsCatastrophe_x_below_0_125': share(int((xa < .125).sum()), len(xa))},
    'grid': {'binsPerAxis': 5, 'cells': cells, 'suppressedCells': sum(1 for c in cells if c['count'] is None)},
    'levelSnapping': {'description': 'Share within 0.03 of one of the five outlook levels (0, 0.25, 0.5, 0.75, 1); an even spread would put about 24% there.',
                      'participants': share(int((np.abs(xa[:, None] - levels).min(1) <= .03).sum()), len(xa)),
                      'simulated': {'n': len(sim_x), 'count': int((np.abs(sim_x[:, None] - levels).min(1) <= .03).sum())}},
    'horseshoe': horseshoe,
    'directScaleAnswer': {'n': answered, 'categories': {k: share(v, answered) for k, v in scale_answers.most_common()}},
    'catalogCoverage': {'withinDistance0_1OfAnySimulatedUser': share(int((dist_any <= .1).sum()), len(PL)),
                        'withinDistance0_1OfAFeaturedThoughtLeader': share(int((dist_feat <= .1).sum()), len(PL)),
                        'simulatedUsers': len(SP), 'featuredThoughtLeaders': len(FEAT)},
    'groups': {'participantsInClustering': len(PC), 'simulatedInClustering': len(SPC), 'groups': groups},
}

# ── 4. P(doom) ────────────────────────────────────────────────────────────
typed = np.array([pdoom_of(p, 'stated') for p in WITH_RESULT if pdoom_of(p, 'stated') is not None])
inferred = np.array([pdoom_of(p, 'inferred') for p in WITH_RESULT if pdoom_of(p, 'inferred') is not None])
BINS = [('0%', -1, 0.0005), ('0.1–4%', 0.0005, .045), ('5–9%', .045, .095), ('10–19%', .095, .195),
        ('20–39%', .195, .395), ('40–69%', .395, .695), ('70–100%', .695, 1.01)]


def bins(vals):
    out = []
    for name, lo, hi in BINS:
        k = int(((vals > lo) & (vals <= hi)).sum()) if lo >= 0 else int((vals <= hi).sum())
        out.append({'bin': name, **share(k, len(vals))})
    return out


def quantiles(v):
    return {f'p{int(q * 100)}': r3(np.quantile(v, q)) for q in [.1, .25, .5, .75, .9]}


def distribution(v):
    return {**median_of(v), 'quantiles': quantiles(v), 'mean': r3(v.mean()),
            'atLeast10pct': share(int((v >= .1).sum()), len(v)), 'atLeast25pct': share(int((v >= .25).sum()), len(v)),
            'atLeast50pct': share(int((v >= .5).sum()), len(v)), 'bins': bins(v),
            'byBand': {name: share(int(sum(1 for x in v if pd_band(x) == name)), len(v)) for name, _, _ in PD_BANDS}}


def iqr_of(v):
    if len(v) < MIN_N:
        return {'n': None, 'median': None, 'iqr': None, 'note': '<10'}
    return {'n': len(v), 'median': r3(np.median(v)), 'iqr': [r3(np.quantile(v, .25)), r3(np.quantile(v, .75))]}


by_side = []
for name in SIDES:
    in_side = [p for p in WITH_RESULT if x_of(p) is not None and side(x_of(p)) == name]
    by_side.append({'side': name,
                    'typed': iqr_of([pdoom_of(p, 'stated') for p in in_side if pdoom_of(p, 'stated') is not None]),
                    'inferred': iqr_of([pdoom_of(p, 'inferred') for p in in_side if pdoom_of(p, 'inferred') is not None])})
asked = [p for p in WITH_RESULT if 'risk.chance' in p['promptIds']]
tp = np.round(typed * 100, 3)
pdoom = {
    'description': 'P(doom) numbers participants typed, and the values the model inferred for everyone else. A typed range shows its midpoint.',
    'n': len(typed) + len(inferred),
    'typed': {**distribution(typed),
              'roundNumbers': share(int(((np.abs(tp / 5 - np.round(tp / 5)) < 1e-6) | (tp <= 1)).sum()), len(tp)),
              'exactly0_1_5_10_20_or_50pct': share(int(np.isin(tp, [0, 1, 5, 10, 20, 50]).sum()), len(tp))},
    'inferred': distribution(inferred),
    'askedDirectQuestion': {'n': len(asked), 'typedANumber': share(sum(1 for p in asked if pdoom_of(p, 'stated') is not None), len(asked))},
    'bySide': by_side,
}

# ── 5. Self-placement and "Does this feel right?" ─────────────────────────
gaps = np.array([(f['guess']['x'], f['guess']['y'], f['placed']['x'], f['placed']['y'])
                 for f, _ in feedback_for('self_placement')
                 if f['guess'] and f['placed'] and f['placed'].get('x') is not None and f['placed'].get('y') is not None])
dist = np.hypot(gaps[:, 2] - gaps[:, 0], gaps[:, 3] - gaps[:, 1])
gap_buckets = C.Counter('close (≤0.10)' if d <= .1 else 'moderate (0.10–0.25)' if d <= .25 else 'far (>0.25)' for d in dist)
ratings = [f['rating'] for f, _ in feedback_for('agreement')]
yes = sum(1 for r in ratings if r == 'yes')
resonance = {
    'description': 'Self-placement before the reveal against the result, and the one-tap "Does this feel right?" rating. Both exist since the 0.7.0 release on Sep 27.',
    'n': len(gaps),
    'meanPlacedMinusGuess': {'x': r3(np.mean(gaps[:, 2] - gaps[:, 0])), 'y': r3(np.mean(gaps[:, 3] - gaps[:, 1]))},
    'gapBuckets': {k: share(gap_buckets[k], len(gaps)) for k in ['close (≤0.10)', 'moderate (0.10–0.25)', 'far (>0.25)']},
    'guessNearOutlookLevel': share(int((np.abs(gaps[:, 0][:, None] - levels).min(1) <= .03).sum()), len(gaps)),
    'feelsRight': {'yes': share(yes, len(ratings)), 'notQuite': share(len(ratings) - yes, len(ratings))},
}

# ── 6. Closest thought leaders ────────────────────────────────────────────
names = {p['slug']: p['name'] for p in PERSONAS}


def top_closest(g, limit):
    counts = C.Counter(p['closest'][0] for p in g if p.get('closest'))
    n = sum(counts.values())
    return {'n': n, 'top': [{'name': names[s], 'slug': s, **share(k, n)} for s, k in counts.most_common(limit) if k >= MIN_N]}


closest = {
    'description': 'The simulated thought leader each person landed closest to, with the app’s own matching against the featured profiles.',
    **top_closest(WITH_RESULT, 10),
    'byWave': {w: top_closest(G[w], 5) for w in ['hn', 'x']},
    'featuredCatalogSize': len(FEAT),
}

json.dump({
    'asOf': AS_OF,
    'period': {'from': LAUNCH, 'to': AS_OF, 'timezone': 'UTC'},
    'source': 'Doom or Bloom production database, read-only: the current version of each counted result',
    'suppression': 'Every count, share or statistic describes at least 10 people; smaller groups are null or "<10".',
    'volume': volume, 'waves': waves, 'map': map_body, 'pdoom': pdoom,
    'resonance': resonance, 'closest': closest,
}, open(sys.argv[1], 'w'), indent=2, ensure_ascii=False)
print(f'{len(PEOPLE)} people, {len(WITH_RESULT)} with a result, {len(PL)} placed; aggregates written.')
