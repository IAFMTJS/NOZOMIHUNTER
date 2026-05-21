import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { JMDICT_FREQUENCY_TIERS } from "@/config/jmdictConfig"
import { toVocabularyEntry } from "@/services/jmdict/normalize"

/** RPG-themed curated pool until full JMDict ingest. `reading` = kana (reb); `romaji` derived if omitted. */
const CURATED_RAW: Array<{
  entSeq: number
  japanese: string
  reading: string
  romaji?: string
  meanings: string[]
  jlpt: string
  frequencyTier: number
}> = [
  { entSeq: 100001, japanese: "水", reading: "みず", meanings: ["water"], jlpt: "N5", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI1 },
  { entSeq: 100002, japanese: "火", reading: "ひ", meanings: ["fire"], jlpt: "N5", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI1 },
  { entSeq: 100003, japanese: "風", reading: "かぜ", meanings: ["wind"], jlpt: "N5", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS1 },
  { entSeq: 100004, japanese: "影", reading: "かげ", meanings: ["shadow"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS2 },
  { entSeq: 100005, japanese: "門", reading: "もん", meanings: ["gate"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC1 },
  { entSeq: 100006, japanese: "剣", reading: "けん", meanings: ["sword"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC1 },
  { entSeq: 100007, japanese: "魂", reading: "たましい", meanings: ["soul", "spirit"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC2 },
  { entSeq: 100008, japanese: "狩人", reading: "かりゅうど", romaji: "karyuudo", meanings: ["hunter"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI1 },
  { entSeq: 100009, japanese: "契約", reading: "けいやく", meanings: ["contract", "pact"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS2 },
  { entSeq: 100010, japanese: "試練", reading: "しれん", meanings: ["trial", "ordeal"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI1 },
  { entSeq: 100011, japanese: "罠", reading: "わな", meanings: ["trap"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI2 },
  { entSeq: 100012, japanese: "封印", reading: "ふういん", meanings: ["seal", "sealing"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI1 },
  { entSeq: 100013, japanese: "覚醒", reading: "かくせい", meanings: ["awakening"], jlpt: "N1", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI2 },
  { entSeq: 100014, japanese: "闇", reading: "やみ", meanings: ["darkness"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC1 },
  { entSeq: 100015, japanese: "光", reading: "ひかり", meanings: ["light"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI2 },
  { entSeq: 100016, japanese: "盾", reading: "たて", meanings: ["shield"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC2 },
  { entSeq: 100017, japanese: "矢", reading: "や", meanings: ["arrow"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC2 },
  { entSeq: 100018, japanese: "魔", reading: "ま", meanings: ["demon", "magic"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC1 },
  { entSeq: 100019, japanese: "霊", reading: "れい", meanings: ["spirit"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI1 },
  { entSeq: 100020, japanese: "結界", reading: "けっかい", meanings: ["barrier"], jlpt: "N1", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI2 },
  { entSeq: 100021, japanese: "追跡", reading: "ついせき", meanings: ["pursuit", "tracking"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS2 },
  { entSeq: 100022, japanese: "潜入", reading: "せんにゅう", meanings: ["infiltration"], jlpt: "N1", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI2 },
  { entSeq: 100023, japanese: "報酬", reading: "ほうしゅう", meanings: ["reward"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS1 },
  { entSeq: 100024, japanese: "危険", reading: "きけん", meanings: ["danger"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI2 },
  { entSeq: 100025, japanese: "勝利", reading: "しょうり", meanings: ["victory"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS1 },
  { entSeq: 100026, japanese: "敗北", reading: "はいぼく", meanings: ["defeat"], jlpt: "N2", frequencyTier: JMDICT_FREQUENCY_TIERS.GAI1 },
  { entSeq: 100027, japanese: "訓練", reading: "くんれん", meanings: ["training"], jlpt: "N3", frequencyTier: JMDICT_FREQUENCY_TIERS.NEWS2 },
  { entSeq: 100028, japanese: "仲間", reading: "なかま", meanings: ["companion", "ally"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI2 },
  { entSeq: 100029, japanese: "敵", reading: "てき", meanings: ["enemy"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.ICHI2 },
  { entSeq: 100030, japanese: "城", reading: "しろ", meanings: ["castle"], jlpt: "N4", frequencyTier: JMDICT_FREQUENCY_TIERS.SPEC1 },
]

export const JMDICT_CURATED: VocabularyEntryContract[] = CURATED_RAW.map((row) =>
  toVocabularyEntry({
    entSeq: row.entSeq,
    japanese: [row.japanese],
    reading: [row.reading],
    meanings: row.meanings,
    jlpt: row.jlpt,
    frequencyTier: row.frequencyTier,
    romaji: row.romaji,
  })
)
