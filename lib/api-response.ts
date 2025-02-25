interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	error?: any;
}

export function successResponse<T>(
	data: T,
	message: string = "Success"
): ApiResponse<T> {
	return {
		success: true,
		message,
		data,
	};
}

export function errorResponse(
	message: string = "Something went wrong",
	error?: any
): ApiResponse {
	return {
		success: false,
		message,
		error,
	};
}
