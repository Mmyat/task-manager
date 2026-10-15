import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** 200 OK with the standard success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

/** 201 Created with the standard success envelope. */
export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data },
    { ...init, status: 201 },
  );
}

/** 204 No Content. */
export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/** Error response with the standard failure envelope. */
export function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    { success: false, error: { code, message, details } },
    { status },
  );
}
