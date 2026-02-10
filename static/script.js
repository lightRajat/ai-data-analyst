document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const questionInput = document.getElementById('question-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const attachmentList = document.getElementById('attachment-list');
    const runBtn = document.getElementById('run-btn');
    const resultsSection = document.getElementById('results');

    // State
    const attachments = new Set(); // Store File objects

    // --- Drag and Drop Logic ---

    // Question Input (Text Files Only)
    questionInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        questionInput.style.borderColor = 'var(--primary)';
        questionInput.style.background = 'rgba(255, 255, 255, 0.9)';
    });

    questionInput.addEventListener('dragleave', () => {
        questionInput.style.borderColor = '';
        questionInput.style.background = '';
    });

    questionInput.addEventListener('drop', (e) => {
        e.preventDefault();
        questionInput.style.borderColor = '';
        questionInput.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                questionInput.value = event.target.result;
            };
            reader.readAsText(file);
        } else {
            alert('Please drop a text file for the analysis plan.');
        }
    });

    // Attachment Drop Zone (Any Supporting Files)
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset to allow same file selection again
    });

    function handleFiles(files) {
        for (const file of files) {
            // Avoid duplicates based on name/size/type
            const isDuplicate = Array.from(attachments).some(
                f => f.name === file.name && f.size === file.size
            );

            if (!isDuplicate) {
                attachments.add(file);
            }
        }
        renderAttachments();
    }

    function renderAttachments() {
        attachmentList.innerHTML = '';

        if (attachments.size === 0) {
            attachmentList.innerHTML = `
                <p style="color: #9ca3af; font-size: 0.85rem; width: 100%; text-align: center; padding: 1rem;">
                    Drag and drop files here or click Add Files
                </p>`;
            return;
        }

        attachments.forEach(file => {
            const item = document.createElement('div');
            item.className = 'attachment-item';

            const name = document.createElement('span');
            name.textContent = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => {
                attachments.delete(file);
                renderAttachments();
            };

            item.appendChild(name);
            item.appendChild(removeBtn);
            attachmentList.appendChild(item);
        });
    }

    // --- API Interaction ---

    runBtn.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        if (!question) {
            alert('Please enter an analysis plan or question.');
            return;
        }

        // UI Loading State
        runBtn.disabled = true;
        runBtn.classList.add('loading');
        const originalBtnText = runBtn.textContent;
        runBtn.textContent = 'Running Analysis...';
        resultsSection.style.display = 'none'; // Hide previous results
        resultsSection.innerHTML = '';

        try {
            const formData = new FormData();

            // Create a blob for the question text
            const questionBlob = new Blob([question], { type: 'text/plain' });
            formData.append('questions.txt', questionBlob, 'questions.txt');

            // Append all attachments
            attachments.forEach(file => {
                formData.append(file.name, file); // Key matches filename for simplicity
            });

            console.log("Sending request...");

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            renderResults(data);

            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Analysis failed:', error);
            resultsSection.style.display = 'block';
            resultsSection.innerHTML = `
                <div class="result-card error-card">
                    <h3>Analysis Failed</h3>
                    <p>${error.message}</p>
                </div>`;
        } finally {
            runBtn.disabled = false;
            runBtn.classList.remove('loading');
            runBtn.textContent = originalBtnText;
        }
    });

    function renderResults(data) {
        resultsSection.style.display = 'grid';
        resultsSection.innerHTML = ''; // Clear previous

        // Helper to determine if a string is Base64 image
        const isBase64Image = (str) => {
            return typeof str === 'string' && (str.length > 100) &&
                (str.trim().match(/^[A-Za-z0-9+/]+={0,2}$/)); // Simple Base64 check
        };

        for (const key in data) {
            const value = data[key];
            const card = document.createElement('div');
            card.className = 'result-card';

            const title = document.createElement('h3');
            // Format key: "edge_count" -> "Edge Count"
            title.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            card.appendChild(title);

            if (isBase64Image(value)) {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${value}`;
                img.alt = key;
                img.className = 'result-image';

                // Add click-to-expand or download logic if desired
                const downloadLink = document.createElement('a');
                downloadLink.href = img.src;
                downloadLink.download = `${key}.png`;
                downloadLink.textContent = 'Download Image';
                downloadLink.className = 'download-link';

                card.appendChild(img);
                card.appendChild(downloadLink);
            } else {
                const content = document.createElement('div');
                content.className = 'result-content';

                if (typeof value === 'object') {
                    content.innerHTML = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
                } else {
                    content.textContent = String(value);
                }
                card.appendChild(content);
            }

            resultsSection.appendChild(card);
        }
    }
});
