export async function fetchUser(username: string) {
  const response = await fetch(
    `${import.meta.env.VITE_GITHUB_API_URL}/users/${username}`
  )

  if (!response.ok) {
    throw new Error('user not found')
  }

  const data = await response.json()
  return data
}
