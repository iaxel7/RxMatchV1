//Function to make a translation request to the server
async function translateText(text, target) {
    const response = await fetch('/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, target }),
    });
    if (!response.ok) {
      console.error('Translation request failed:', response.statusText);
      return;
    }
    // Parse and return the translated text from the server's response
    const data = await response.json();
    return data.translatedText;
  }
  // Function to translate all elements with data-translate attribute
  async function translateAllElements(targetLanguage) {
    const elements = document.querySelectorAll('[data-translate]');
    for (const element of elements) {
      const textToTranslate = element.innerText;
      const translatedText = await translateText(textToTranslate, targetLanguage);
      if (translatedText) {
        element.innerText = translatedText;
      }
    }
  }
  // Add an event listener to the translate button
  document.getElementById('translate-button').addEventListener('click', () => {
    // Perform the translation (target language: Spanish)
    translateAllElements('es');
  });