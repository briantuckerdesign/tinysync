import type { Site } from 'webflow-api/api'

export async function getSites(token: string): Promise<Site[]> {
    const url = `https://api.webflow.com/v2/sites`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data: any = await response.json()

        const sites: Site[] = data.sites

        return sites
    } catch (error) {
        throw error
    }
}
