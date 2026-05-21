/** Hepburn-style kana → romaji (learner-facing, no macrons). */

const COMBOS: ReadonlyArray<readonly [string, string]> = [
  ["きゃ", "kya"],
  ["きゅ", "kyu"],
  ["きょ", "kyo"],
  ["ぎゃ", "gya"],
  ["ぎゅ", "gyu"],
  ["ぎょ", "gyo"],
  ["しゃ", "sha"],
  ["しゅ", "shu"],
  ["しょ", "sho"],
  ["じゃ", "ja"],
  ["じゅ", "ju"],
  ["じょ", "jo"],
  ["ちゃ", "cha"],
  ["ちゅ", "chu"],
  ["ちょ", "cho"],
  ["にゃ", "nya"],
  ["にゅ", "nyu"],
  ["にょ", "nyo"],
  ["ひゃ", "hya"],
  ["ひゅ", "hyu"],
  ["ひょ", "hyo"],
  ["びゃ", "bya"],
  ["びゅ", "byu"],
  ["びょ", "byo"],
  ["ぴゃ", "pya"],
  ["ぴゅ", "pyu"],
  ["ぴょ", "pyo"],
  ["みゃ", "mya"],
  ["みゅ", "myu"],
  ["みょ", "myo"],
  ["りゃ", "rya"],
  ["りゅ", "ryu"],
  ["りょ", "ryo"],
  ["くゎ", "kwa"],
  ["ぐゎ", "gwa"],
  ["てぃ", "ti"],
  ["でぃ", "di"],
  ["でゅ", "dyu"],
  ["うぃ", "wi"],
  ["うぇ", "we"],
  ["うぉ", "wo"],
  ["ゔぁ", "va"],
  ["ゔぃ", "vi"],
  ["ゔぇ", "ve"],
  ["ゔぉ", "vo"],
  ["ゔ", "vu"],
  ["ふぁ", "fa"],
  ["ふぃ", "fi"],
  ["ふぇ", "fe"],
  ["ふぉ", "fo"],
]

const BASIC: Readonly<Record<string, string>> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  ゐ: "wi",
  ゑ: "we",
  を: "o",
  ん: "n",
}

const SMALL: Readonly<Record<string, string>> = {
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゎ: "wa",
}

const KATAKANA_OFFSET = 0x60

export function containsKana(value: string): boolean {
  return /[\u3040-\u309f\u30a0-\u30ff]/.test(value)
}

export function toHiragana(value: string): string {
  return value.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - KATAKANA_OFFSET)
  )
}

function doubleConsonant(romaji: string): string {
  const c = romaji[0]
  if (!c) return romaji
  if (c === "n") return "nn" + romaji.slice(1)
  return c + romaji
}

function lengthenVowel(romaji: string): string {
  if (!romaji) return ""
  const last = romaji[romaji.length - 1]
  if ("aeiou".includes(last)) return romaji + last
  return romaji + "u"
}

function syllableAt(text: string, index: number): { romaji: string; length: number } | null {
  for (const [combo, romaji] of COMBOS) {
    if (text.startsWith(combo, index)) {
      return { romaji, length: combo.length }
    }
  }

  const ch = text[index]
  const small = text[index + 1]
  if (ch && small && SMALL[small] && BASIC[ch]) {
    const base = BASIC[ch].slice(0, -1) || BASIC[ch]
    return { romaji: base + SMALL[small], length: 2 }
  }

  if (ch && BASIC[ch]) {
    return { romaji: BASIC[ch], length: 1 }
  }

  return null
}

/**
 * Convert hiragana/katakana (and ー) to romaji. Kanji in the input are skipped.
 */
export function kanaToRomaji(input: string): string {
  const hiragana = toHiragana(input.normalize("NFKC"))
  let out = ""
  let i = 0
  let sokuon = false

  while (i < hiragana.length) {
    const ch = hiragana[i]

    if (/[\u4e00-\u9faf\u3400-\u4dbf]/.test(ch)) {
      sokuon = false
      i += 1
      continue
    }

    if (ch === "っ") {
      sokuon = true
      i += 1
      continue
    }

    if (ch === "ん") {
      out += "n"
      sokuon = false
      i += 1
      continue
    }

    if (ch === "ー") {
      out = lengthenVowel(out)
      sokuon = false
      i += 1
      continue
    }

    const syllable = syllableAt(hiragana, i)
    if (syllable) {
      let piece = syllable.romaji
      if (sokuon) {
        piece = doubleConsonant(piece)
        sokuon = false
      }
      out += piece
      i += syllable.length
      continue
    }

    if (!/\s/.test(ch)) {
      out += ch
    }
    sokuon = false
    i += 1
  }

  return out.replace(/\s+/g, " ").trim()
}
