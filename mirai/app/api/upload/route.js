    import { Pinecone } from '@pinecone-database/pinecone';
    import { GoogleGenerativeAI } from '@google/generative-ai';
    import pdf from 'pdf-parse';

    // This function handles POST requests to the /api/upload endpoint
    export async function POST(req) {
        try {
            // --- 1. INITIALIZE CLIENTS ---
            // Initialize Pinecone client using API key from environment variables
            const pc = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY,
            });
            const pineconeIndex = pc.index(process.env.PINECONE_INDEX);

            // Initialize Google Gemini client
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

            // --- 2. PARSE THE UPLOADED FILE ---
            // 'req.formData()' handles file uploads
            const data = await req.formData();
            const file = data.get('file');

            if (!file) {
                return new Response(JSON.stringify({ message: "No file found" }), { status: 400 });
            }

            // Convert the uploaded file into a buffer
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            // --- 3. EXTRACT TEXT FROM THE PDF ---
            const pdfData = await pdf(fileBuffer);
            const pdfText = pdfData.text;

            // --- 4. CHUNK THE TEXT ---
            // Large language models have context limits. We need to split the text
            // into smaller, overlapping chunks to ensure all information is captured.
            const chunkSize = 1000;
            const chunkOverlap = 100;
            const textChunks = [];

            for (let i = 0; i < pdfText.length; i += chunkSize - chunkOverlap) {
                const chunk = pdfText.substring(i, i + chunkSize);
                textChunks.push(chunk);
            }

            // --- 5. CREATE EMBEDDINGS ---
            // Get the Gemini embedding model
            const model = genAI.getGenerativeModel({ model: "embedding-001" });
            
            // Convert each text chunk into a numerical vector (embedding)
            const result = await model.batchEmbedContents({
                requests: textChunks.map(chunk => ({ content: chunk, task_type: "RETRIEVAL_DOCUMENT" }))
            });
            const embeddings = result.embeddings;

            // --- 6. PREPARE AND UPSERT VECTORS TO PINECONE ---
            // Create vector objects in the format Pinecone expects
            const vectors = embeddings.map((embedding, index) => ({
                id: `${file.name}-${Date.now()}-${index}`, // Create a unique ID for each vector
                values: embedding.values,
                metadata: { text: textChunks[index] } // Store the original text chunk
            }));
            
            // Before adding new data, it's a good practice to clear any old data
            // for this namespace/file to avoid confusion. For simplicity here we clear all.
            // In a multi-user app, you'd use namespaces.
            await pineconeIndex.deleteAll();

            // Send the vectors to Pinecone to be stored
            await pineconeIndex.upsert(vectors);

            // --- 7. SEND SUCCESS RESPONSE ---
            return new Response(JSON.stringify({ message: "File processed successfully" }), { status: 200 });

        } catch (error) {
            console.error("Error processing file:", error);
            return new Response(JSON.stringify({ message: `Error processing file: ${error.message}` }), { status: 500 });
        }
    }
    
