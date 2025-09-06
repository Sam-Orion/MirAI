    "use client";

    import { useState, useRef, useEffect } from 'react';

    // A custom function to automatically scroll the chat window
    const useChatScroll = (dep) => {
        const ref = useRef(null);
        useEffect(() => {
            if (ref.current) {
                ref.current.scrollTop = ref.current.scrollHeight;
            }
        }, [dep]);
        return ref;
    };

    // This is our main Page component
    export default function Page() {
        // 'useState' hooks manage the component's state
        const [messages, setMessages] = useState([]);
        const [input, setInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [file, setFile] = useState(null);
        const [fileIsUploading, setFileIsUploading] = useState(false);
        const [fileReady, setFileReady] = useState(false);

        const chatParent = useChatScroll(messages);
        const fileInputRef = useRef(null);

        // 'useEffect' runs once when the component first loads
        useEffect(() => {
            // Set the initial welcome message
            setMessages([{
                role: 'ai',
                content: 'Hello! Please upload a PDF to begin. I can answer questions about its content.'
            }]);
        }, []);
        
        // We will add functions to handle file uploads and sending messages here later.
        const handleFileChange = (e) => { console.log("File selected"); };
        const handleSubmit = (e) => { e.preventDefault(); console.log("Form submitted"); };

        return (
            <div className="bg-slate-100 flex items-center justify-center min-h-screen">
                 <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col p-6 space-y-4">
                    <header className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <h1 className="text-2xl font-bold text-slate-800">MirAI</h1>
                        <div className="flex items-center space-x-2">
                            <div 
                                className={`w-3 h-3 rounded-full transition-colors ${fileReady ? 'bg-green-500' : 'bg-red-500'}`}
                                title={fileReady ? 'Ready' : 'No PDF Loaded'}
                            ></div>
                            <span className="text-sm font-medium text-slate-600">
                                {fileReady ? file?.name : 'No PDF Loaded'}
                            </span>
                        </div>
                    </header>

                    <main ref={chatParent} className="flex-grow flex flex-col overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-lg">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg text-sm max-w-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-3 rounded-lg text-sm max-w-xl bg-gray-200 text-gray-800">
                                <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="pt-4 border-t border-slate-200">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={fileIsUploading}
                                className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {fileIsUploading ? 'Uploading...' : 'Upload PDF'}
                            </button>
                            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />

                            <form onSubmit={handleSubmit} className="flex-grow flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={fileReady ? "Ask a question..." : "Please upload a PDF first"}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-slate-100"
                                    disabled={!fileReady || isLoading}
                                />
                                <button
                                    type="submit"
                                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                    disabled={!input.trim() || isLoading || !fileReady}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
    
