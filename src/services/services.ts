import type { Service } from "./types";
import { prepareService } from "./utils";

import google from "./google";
import jisho from "./jisho";


export default [google, jisho].map(prepareService) as Service[];
