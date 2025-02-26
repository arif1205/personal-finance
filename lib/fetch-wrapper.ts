interface FetchOptions extends RequestInit {
	params?: Record<string, string>;
}

interface ApiError extends Error {
	status?: number;
	data?: any;
}

class FetchWrapper {
	private baseUrl: string;

	constructor(baseUrl: string = "/api") {
		this.baseUrl = baseUrl;
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		const contentType = response.headers.get("content-type");
		const isJson = contentType?.includes("application/json");
		const data = isJson ? await response.json() : await response.text();

		if (!response.ok) {
			const error: ApiError = new Error(
				typeof data === "object" ? data.message : "An error occurred"
			);
			error.status = response.status;
			error.data = data;
			throw error;
		}

		return data as T;
	}

	private createUrl(endpoint: string, params?: Record<string, string>): string {
		const url = new URL(this.baseUrl + endpoint, window.location.origin);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		return url.toString();
	}

	private getDefaultHeaders(): HeadersInit {
		return {
			"Content-Type": "application/json",
		};
	}

	async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
		const { params, headers, ...rest } = options;
		const response = await fetch(this.createUrl(endpoint, params), {
			method: "GET",
			headers: {
				...this.getDefaultHeaders(),
				...headers,
			},
			...rest,
		});

		return this.handleResponse<T>(response);
	}

	async post<T>(
		endpoint: string,
		data?: any,
		options: FetchOptions = {}
	): Promise<T> {
		const { params, headers, ...rest } = options;

		const response = await fetch(this.createUrl(endpoint, params), {
			method: "POST",
			headers: {
				...this.getDefaultHeaders(),
				...headers,
			},
			body: JSON.stringify(data),
			credentials: "include",
			...rest,
		});

		return this.handleResponse<T>(response);
	}

	async patch<T>(
		endpoint: string,
		data?: any,
		options: FetchOptions = {}
	): Promise<T> {
		const { params, headers, ...rest } = options;
		const response = await fetch(this.createUrl(endpoint, params), {
			method: "PATCH",
			headers: {
				...this.getDefaultHeaders(),
				...headers,
			},
			body: JSON.stringify(data),
			credentials: "include",
			...rest,
		});

		return this.handleResponse<T>(response);
	}

	async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
		const { params, headers, ...rest } = options;
		const response = await fetch(this.createUrl(endpoint, params), {
			method: "DELETE",
			headers: {
				...this.getDefaultHeaders(),
				...headers,
			},
			credentials: "include",
			...rest,
		});

		return this.handleResponse<T>(response);
	}
}

// Create a singleton instance
export const api = new FetchWrapper();
