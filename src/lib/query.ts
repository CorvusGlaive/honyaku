import { addHistory } from "./history";

class Result {
	isLoading = false;
	isError = false;
	isSuccess = false;
	state = "initial" as "initial" | "loading" | "error" | "success";
	data = null;
	error = null;

	setState(st: typeof this.state, dataOrError?: unknown) {
		this.#reset();
		this.state = st;
		this.isError = st === "error";
		this.isLoading = st === "loading";
		this.isSuccess = st === "success";
		if (st === "success") this.data = dataOrError;
		if (st === "error") this.error = dataOrError;
		return this;
	}

	#reset() {
		this.isError = false;
		this.isLoading = false;
		this.isSuccess = false;
		this.data = null;
		this.error = null;
		this.state = "initial";
	}
}

type FetchFN = (
	...args: unknown[]
) => Promise<{ result: unknown; keys: string[] }>;
export class Query {
	#result: Result;
	#key: string;
	#fn: FetchFN;
	#listeners: Set<any>;

	constructor(name: string, fn: FetchFN) {
		this.#key = name;
		this.#fn = fn;
		this.#result = new Result();
		this.#listeners = new Set();
		this.fetch = this.fetch.bind(this);
		this.setState = this.setState.bind(this);
	}

	setState(state: Result["state"], dataOrError?: unknown) {
		this.#result.setState(state, dataOrError);
		const res = Object.create(this);
		Object.assign(res, this.#result);
		this.#listeners.forEach((cb) => cb(res));
	}

	subscribe(fn: (r: this & Result) => void) {
		const res = Object.create(this);
		Object.assign(res, this.#result);
		fn(res);
		this.#listeners.add(fn);
		return () => {
			this.#listeners.delete(fn);
		};
	}

	async fetch(...args: string[]) {
		this.setState("loading");
		let res: Awaited<ReturnType<FetchFN>>;

		try {
			res = await this.#fn(...args);
			this.setState("success", res.result);
			this.#addHistory(res);
		} catch (error) {
			this.setState("error", error);
		}

		return res;
	}

	#addHistory(result: Awaited<ReturnType<FetchFN>>) {
		addHistory({
			service: this.#key,
			keys: `${this.#key}:${result.keys.join(":")}`,
			query: result.keys[0],
			result: result.result,
		});
	}
}
