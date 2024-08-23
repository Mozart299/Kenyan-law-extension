import { pdfjsLib } from './pdf-loader.js';

const pdfUrl = 'TheConstitutionOfKenya.pdf'; 

async function loadPdf() {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const textContent = await extractTextFromPdf(pdf);
    return textContent;
}

async function extractTextFromPdf(pdf) {
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += pageText + '\n';
    }
    return text;
}

document.getElementById('searchButton').addEventListener('click', async function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        try {
            document.getElementById('loadingDiv').style.display = 'block';
            const constitutionText = await loadPdf();
            const results = searchConstitution(searchTerm, constitutionText);
            displayResults(results, searchTerm);
        } catch (error) {
            console.error('Error during search:', error);
            alert('An error occurred while searching. Please try again.');
        } finally {
            document.getElementById('loadingDiv').style.display = 'none';
        }
    } else {
        alert('Please enter a search term.');
    }
});




function searchConstitution(term, text) {
    const sentenceRegex = /[^.!?]*[.!?]/g; // Regular expression to match sentences
    const matches = [];
    let match;

    // Loop through all sentences in the text
    while ((match = sentenceRegex.exec(text)) !== null) {
        const sentence = match[0];
        const searchTermRegex = new RegExp(term, 'i'); // Regular expression for the search term

        // Check if the sentence contains the search term
        if (searchTermRegex.test(sentence)) {
            matches.push({
                sentence: sentence.trim(),  // Trim any leading/trailing whitespace
                index: match.index           // Store the position of the sentence in the text
            });
        }
    }
    return matches;
}


function displayResults(results, searchTerm) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsDiv.innerText = 'No results found.';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `<p>${result.sentence.replace(new RegExp(searchTerm, 'gi'), '<strong>$&</strong>')}</p>
                                <small>Found at position: ${result.index}</small>`;
        resultsDiv.appendChild(resultItem);
    });
}

document.getElementById('googleButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        const query = `Kenyan law on ${searchTerm}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(googleSearchUrl, '_blank');
    } else {
        alert('Please enter a search term.');
    }
});
