import { z } from 'zod'
import { oneLinerProblems } from './one-liner-rules'
import aellaGirl from '@/content/profiles/aella_girl.json'
import andrewyng from '@/content/profiles/andrewyng.json'
import balajis from '@/content/profiles/balajis.json'
import barackobama from '@/content/profiles/barackobama.json'
import billgates from '@/content/profiles/billgates.json'
import dacemoglumit from '@/content/profiles/dacemoglumit.json'
import darioamodei from '@/content/profiles/darioamodei.json'
import davidsacks from '@/content/profiles/davidsacks.json'
import demishassabis from '@/content/profiles/demishassabis.json'
import dhh from '@/content/profiles/dhh.json'
import dkokotajlo from '@/content/profiles/dkokotajlo.json'
import drfeifei from '@/content/profiles/drfeifei.json'
import dwarkeshSp from '@/content/profiles/dwarkesh_sp.json'
import edzitron from '@/content/profiles/edzitron.json'
import elonmusk from '@/content/profiles/elonmusk.json'
import esyudkowsky from '@/content/profiles/esyudkowsky.json'
import finkd from '@/content/profiles/finkd.json'
import garymarcus from '@/content/profiles/garymarcus.json'
import geoffreyhinton from '@/content/profiles/geoffreyhinton.json'
import ilyasut from '@/content/profiles/ilyasut.json'
import jensenhuang from '@/content/profiles/jensenhuang.json'
import karpathy from '@/content/profiles/karpathy.json'
import kevinroose from '@/content/profiles/kevinroose.json'
import liangWenfeng from '@/content/profiles/liang-wenfeng.json'
import noamshazeer from '@/content/profiles/noamshazeer.json'
import npcollapse from '@/content/profiles/npcollapse.json'
import plinz from '@/content/profiles/plinz.json'
import pmarca from '@/content/profiles/pmarca.json'
import realdonaldtrump from '@/content/profiles/realdonaldtrump.json'
import realgeorgehotz from '@/content/profiles/realgeorgehotz.json'
import richardhanania from '@/content/profiles/richardhanania.json'
import richardssutton from '@/content/profiles/richardssutton.json'
import sama from '@/content/profiles/sama.json'
import schmidhuberai from '@/content/profiles/schmidhuberai.json'
import sensanders from '@/content/profiles/sensanders.json'
import slatestarcodex from '@/content/profiles/slatestarcodex.json'
import so8res from '@/content/profiles/so8res.json'
import tegmark from '@/content/profiles/tegmark.json'
import timnitgebru from '@/content/profiles/timnitgebru.json'
import tylercowen from '@/content/profiles/tylercowen.json'
import ylecun from '@/content/profiles/ylecun.json'
import yoshuaBengio from '@/content/profiles/yoshua_bengio.json'
import coryDoctorow from '@/content/profiles/cory-doctorow.json'
import haJoonChang from '@/content/profiles/ha-joon-chang.json'
import tedChiang from '@/content/profiles/ted-chiang.json'
import paulKrugman from '@/content/profiles/paul-krugman.json'
import naomiKlein from '@/content/profiles/naomi-klein.json'
import jonStewart from '@/content/profiles/jon-stewart.json'
import elizabethWarren from '@/content/profiles/elizabeth-warren.json'
import zeroxSero from '@/content/profiles/0xsero.json'
import aispecies from '@/content/profiles/aispecies.json'
import alexandrWang from '@/content/profiles/alexandr_wang.json'
import ankkala from '@/content/profiles/ankkala.json'
import applesJimmy from '@/content/profiles/apples_jimmy.json'
import basedjensen from '@/content/profiles/basedjensen.json'
import bryanJohnson from '@/content/profiles/bryan_johnson.json'
import bubbleboi from '@/content/profiles/bubbleboi.json'
import distributedkv from '@/content/profiles/distributedkv.json'
import dylan522p from '@/content/profiles/dylan522p.json'
import emostaque from '@/content/profiles/emostaque.json'
import flowersslop from '@/content/profiles/flowersslop.json'
import hopesRevenge from '@/content/profiles/hopes_revenge.json'
import luacantu from '@/content/profiles/luacantu.json'
import parmita from '@/content/profiles/parmita.json'
import piercelilholt from '@/content/profiles/piercelilholt.json'
import rookepoole from '@/content/profiles/rookepoole.json'
import scobleizer from '@/content/profiles/scobleizer.json'
import shakoistslog from '@/content/profiles/shakoistslog.json'
import signulll from '@/content/profiles/signulll.json'
import sierracatalina from '@/content/profiles/sierracatalina.json'
import suavecito585 from '@/content/profiles/suavecito585.json'
import tekbog from '@/content/profiles/tekbog.json'
import theo from '@/content/profiles/theo.json'
import thsottiaux from '@/content/profiles/thsottiaux.json'
import tunguz from '@/content/profiles/tunguz.json'
import voidstatekate from '@/content/profiles/voidstatekate.json'
import xfreeze from '@/content/profiles/xfreeze.json'
import zekramu from '@/content/profiles/zekramu.json'

// What a simulated user's real person has said about AI: short, dated quotes
// in their own words, each checked against the page it links to. Shown on the
// profile below the map (docs/user-journeys.md#public-statements). Never quote
// simulated answers here.

const day = z.iso.date()
const dayOrMonth = z.union([day, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)])

const publicStatementSchema = z.strictObject({
  /** Exact words, without surrounding quotation marks. */
  quote: z.string().min(1).max(320),
  /** When they said or published it: YYYY-MM-DD, or YYYY-MM when only the month is known. */
  date: dayOrMonth,
  /** Where, as readers would name it: "CNN, The Lead" or "Essay, The Urgency of Interpretability". */
  venue: z.string().min(1).max(90),
  url: z.url({ protocol: /^https$/ }),
  /** When we last matched the quote against the linked page. */
  verified: day
})
export type PublicStatement = z.infer<typeof publicStatementSchema>

export const publicStatementsSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9_-]{1,80}$/),
  /** One neutral sentence under the one-liner rule. */
  summary: z.string(),
  statements: z.array(publicStatementSchema).min(3).max(7)
})
export type PublicStatements = z.infer<typeof publicStatementsSchema>

/** Quotes stay short enough to read at a glance; 25 words is the target. */
const maxQuoteWords = 30

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

/** The mechanical checks; whether quotes are fair to the person still needs a read. */
export function publicStatementProblems(file: PublicStatements) {
  const problems = oneLinerProblems(file.summary).map(
    (problem) => `summary ${problem}`
  )
  file.statements.forEach((statement, index) => {
    const at = `statement ${index + 1}`
    const { quote } = statement
    if (quote !== quote.trim() || /\s{2}|\n/.test(quote))
      problems.push(`${at} has stray whitespace`)
    if (/^[“”"‘’']|[“”"‘’']$/.test(quote))
      problems.push(`${at} wraps its quote in quotation marks`)
    if (words(quote) > maxQuoteWords)
      problems.push(`${at} has ${words(quote)} words, over ${maxQuoteWords}`)
    if (statement.verified < statement.date.slice(0, 10))
      problems.push(`${at} was verified before it was said`)
    const next = file.statements[index + 1]
    if (next && next.date > statement.date)
      problems.push(`${at} is older than the one after it; list newest first`)
  })
  return problems
}

const files = [
  aellaGirl,
  andrewyng,
  balajis,
  barackobama,
  billgates,
  dacemoglumit,
  darioamodei,
  davidsacks,
  demishassabis,
  dhh,
  dkokotajlo,
  drfeifei,
  dwarkeshSp,
  edzitron,
  elonmusk,
  esyudkowsky,
  finkd,
  garymarcus,
  geoffreyhinton,
  ilyasut,
  jensenhuang,
  karpathy,
  kevinroose,
  liangWenfeng,
  noamshazeer,
  npcollapse,
  plinz,
  pmarca,
  realdonaldtrump,
  realgeorgehotz,
  richardhanania,
  richardssutton,
  sama,
  schmidhuberai,
  sensanders,
  slatestarcodex,
  so8res,
  tegmark,
  timnitgebru,
  tylercowen,
  ylecun,
  yoshuaBengio,
  coryDoctorow,
  haJoonChang,
  tedChiang,
  paulKrugman,
  naomiKlein,
  jonStewart,
  elizabethWarren,
  zeroxSero,
  aispecies,
  alexandrWang,
  ankkala,
  applesJimmy,
  basedjensen,
  bryanJohnson,
  bubbleboi,
  distributedkv,
  dylan522p,
  emostaque,
  flowersslop,
  hopesRevenge,
  luacantu,
  parmita,
  piercelilholt,
  rookepoole,
  scobleizer,
  shakoistslog,
  signulll,
  sierracatalina,
  suavecito585,
  tekbog,
  theo,
  thsottiaux,
  tunguz,
  voidstatekate,
  xfreeze,
  zekramu
].map((file) => publicStatementsSchema.parse(file))

/** Every profile with sourced statements, keyed by slug. */
export const publicStatements: ReadonlyMap<string, PublicStatements> = new Map(
  files.map((file) => [file.slug, file])
)
