import { addHistory } from "./history";

type AwaitedReturn<T extends (...args: any[]) => Promise<any>> = Awaited<
	ReturnType<T>
>;
type FetchFN<T = any> = (
	...args: any[]
) => Promise<{ result: T; keys: string[] }>;

export class Query<
	TQueryFN extends FetchFN,
	TData = AwaitedReturn<TQueryFN>["result"],
	TError = Error,
> {
	#key: string;
	#fn: TQueryFN;

	#state: "initial" | "loading" | "error" | "success" = $state("initial");
	isLoading = $derived(this.#state === "loading");
	isError = $derived(this.#state === "error");
	isSuccess = $derived(this.#state === "success");
	#data?: TData = $state();
	#error?: TError = $state();

	constructor(name: string, fn: TQueryFN) {
		this.#key = name;
		this.#fn = fn;
	}

	get state() {
		return this.#state;
	}
	get data() {
		return this.#data;
	}
	get error() {
		return this.#error;
	}

	setState(state: typeof this.state, dataOrError?: TData | TError) {
		this.#state = state;
		if (state === "success") this.#data = dataOrError as TData;
		if (state === "error") this.#error = dataOrError as TError;
		if (state === "initial") {
			this.#data = this.#error = undefined;
		}
	}

	async fetch(...args: Parameters<TQueryFN>) {
		this.setState("loading");
		let res: AwaitedReturn<TQueryFN>;
		try {
			res = (await this.#fn(...args)) as AwaitedReturn<TQueryFN>;
			this.setState("success", res.result as TData);
			this.#addHistory(res);
		} catch (error) {
			this.setState("error", error as TError);
		}
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
