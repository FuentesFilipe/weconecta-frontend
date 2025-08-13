export interface ListWrapperDto<T> {
	data: T[]
}

export interface PaginatedDto<T> extends ListWrapperDto<T> {
	page: number
}
