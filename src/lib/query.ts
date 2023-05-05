import { addHistory } from "./history";

type AwaitedReturn<T extends (...args: unknown[]) => Promise<any>> = Awaited<
	ReturnType<T>
>;
type FetchFN = (
	...args: unknown[]
) => Promise<{ result: unknown; keys: string[] }>;

export class Query<
	TQueryFN extends FetchFN,
	TData = AwaitedReturn<TQueryFN>["result"]
> {
	#result: Result<TData>;
	#key: string;
	#fn: TQueryFN;
	#listeners: Set<any>;

	constructor(name: string, fn: TQueryFN) {
		this.#key = name;
		this.#fn = fn;
		this.#result = new Result();
		this.#listeners = new Set();
		this.fetch = this.fetch.bind(this);
		this.setState = this.setState.bind(this);
	}

	setState(state: Result["state"], dataOrError?: TData) {
		this.#result.setState(state, dataOrError);
		const res = Object.create(this);
		Object.assign(res, this.#result);
		this.#listeners.forEach((cb) => cb(res));
	}

	subscribe(fn: (r: Omit<this, "subscribe"> & Result<TData>) => void) {
		const res = Object.create(this);
		Object.assign(res, this.#result);
		delete res.subscribe;
		fn(res);
		this.#listeners.add(fn);
		return () => {
			this.#listeners.delete(fn);
		};
	}

	async fetch(...args: Parameters<TQueryFN>): Promise<AwaitedReturn<TQueryFN>> {
		this.setState("loading");
		let res: AwaitedReturn<TQueryFN>;

		try {
			res = (await this.#fn(...args)) as AwaitedReturn<TQueryFN>;
			this.setState("success", res.result as TData);
			this.#addHistory(res);
		} catch (error) {
			this.setState("error", error);
		}

		return res;
	}

	#addHistory(result: AwaitedReturn<TQueryFN>) {
		addHistory({
			service: this.#key,
			keys: `${this.#key}:${result.keys.join(":")}`,
			query: result.keys[0],
			result: result.result,
		});
	}
}

class Result<TData = unknown, TError = Error> {
	isLoading = false;
	isError = false;
	isSuccess = false;
	state = "initial" as "initial" | "loading" | "error" | "success";
	data: TData = null;
	error: TError = null;

	setState(st: typeof this.state, dataOrError?: TData | TError) {
		this.#reset();
		this.state = st;
		this.isError = st === "error";
		this.isLoading = st === "loading";
		this.isSuccess = st === "success";
		if (st === "success") this.data = dataOrError as TData;
		if (st === "error") this.error = dataOrError as TError;
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
