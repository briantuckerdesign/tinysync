export async function writeToJSONFile(
    destinationPath: string,
    data: any
): Promise<boolean> {
    try {
        const jsonData = JSON.stringify(data, null, 2)
        await Bun.write(destinationPath, jsonData)

        return true
    } catch (error) {
        console.error('Error writing to JSON file:', error)
        return false
    }
}
