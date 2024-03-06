export function wordFreq(string) {
    let list = string.split(/[^\p{L}0-9_]+/u)
    let freq = {};
    list.forEach((word) => {
        if (!(word in freq)) freq[word] = 0;
        freq[word]++;
    });
    // Convert the frequency object into an array of key-value pairs
    const freqArray = Object.entries(freq);

    // Sort the array by frequency (in descending order)
    freqArray.sort((a, b) => b[1] - a[1]);

    // Create a new object from the sorted array
    const sortedFreq = {};
    freqArray.forEach(([word, frequency]) => {
        sortedFreq[word] = frequency;
    });

    return sortedFreq;
}