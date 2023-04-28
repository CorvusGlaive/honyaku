export interface GoogleTranslateResponse {
  sentences: Sentence[];
  dict: Dict[];
  src: string;
  confidence: number;
  spell: Spell;
  ld_result: LdResult;
  definitions: Definition[];
  srcLang: string;
  targetLang: string;
}

export interface Definition {
  pos: string;
  entry: DefinitionEntry[];
  base_form: string;
}

export interface DefinitionEntry {
  gloss: string;
  definition_id: string;
}

export interface Dict {
  pos: string;
  terms: string[];
  entry: DictEntry[];
  base_form: string;
  pos_enum: number;
}

export interface DictEntry {
  word: string;
  reverse_translation: string[];
  score: number;
}

export interface LdResult {
  srclangs: string[];
  srclangs_confidences: number[];
  extended_srclangs: string[];
}

export interface Sentence {
  trans?: string;
  orig?: string;
  backend?: number;
  model_specification?: Spell[];
  translation_engine_debug_info?: TranslationEngineDebugInfo[];
  translit?: string;
  src_translit?: string;
}

export interface Spell { }

export interface TranslationEngineDebugInfo {
  model_tracking: ModelTracking;
}

export interface ModelTracking {
  checkpoint_md5: string;
  launch_doc: string;
}
