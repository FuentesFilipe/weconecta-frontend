export function parseName(fullName: string) {
	const nameParts = fullName.trim().split(' ')
	const name = nameParts[0]
	const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
	const friendlyName = fullName
	return { name, lastName, friendlyName }
}
