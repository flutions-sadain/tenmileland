import React, { useEffect, useState, useRef } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import PulseLoader from 'react-spinners/PulseLoader';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BiCheck, BiCopy } from 'react-icons/bi';

// const sampleMarkdownResponse = `
// # Welcome to the Markdown Chatbot!

// This chatbot can render various types of Markdown elements. Here are some examples:

// ## Text Formatting

// You can use **bold**, *italic*, or ~~strikethrough~~ text.

// ## Lists

// Unordered list:
// - Item 1
// - Item 2
// - Item 3

// Ordered list:
// 1. First item
// 2. Second item
// 3. Third item

// ## List
// - Item 1
// - Item 2
//   - Subitem 1
//   - Subitem 2

// ## Links and Images

// Here's a [link to Google](https://www.google.com).

// And here's an image:

// ![Cute cat](https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg)

// ## Code Blocks

// Inline code: \`console.log('Hello, world!')\`

// Code block with syntax highlighting:

// \`\`\`javascript
// function greet(name) {
//   return \`Hello, \${name}!\`;
// }

// console.log(greet('User'));
// \`\`\`

// ## Tables

// | Header 1 | Header 2 | Header 3 |
// |----------|----------|----------|
// | Cell 1   | Cell 2   | Cell 2   |
// | Cell 3   | Cell 4   | Cell 2   |

// ## Blockquotes

// > This is a blockquote.
// > It can span multiple lines.

// ## Horizontal Rule

// ---

// That's it! Feel free to ask any questions about Markdown or try out different elements.
// `

const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                aria-label={copied ? "Copied" : "Copy to clipboard"}
            >
                {copied ? <BiCheck size={20} /> : <BiCopy size={20} />}
            </button>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    padding: '1rem',
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

const Chatbot = () => {
    const [messages, setMessages] = useState([
        // { type: 'message', content: sampleMarkdownResponse }
    ]);
    const [loading, setLoading] = useState(false);
    const [botLoading, setBotLoading] = useState(false);
    const [input, setInput] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // const websocketBaseUrl = process.env.REACT_APP_WEBSOCKET_API_URL;
        const websocketBaseUrl = "ws://localhost:8097/";
        const urlParams = new URLSearchParams(window.location.pathname);
        const sessionId = urlParams.get('chat') || '12345';

        if (!websocketBaseUrl) {
            console.error('WebSocket URL is undefined');
        }

        const websocketUrl = `${websocketBaseUrl}/chat/${sessionId}`;
        ws.current = new WebSocket(websocketUrl);

        ws.current.onopen = () => {
            setLoading(false);
        };

        ws.current.onmessage = (event) => {
            setBotLoading(false);
            const data = JSON.parse(event.data);
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', ...data }]);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.current.close();
        };
    }, []);

    const handleSendMessage = () => {
        if (input.trim() !== '') {
            setMessages(prevMessages => [...prevMessages, { sender: 'user', content: input }]);
            setInput('');
            setBotLoading(true);
            const payload = {
                "content": input
            };
            ws.current.send(JSON.stringify(payload));
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
        setBotLoading(false);
    };

    return (
        <div>
            <div id="hs-application-sidebar" className="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300" role="dialog" tabIndex="-1" aria-label="Sidebar">
                <nav className="size-full flex flex-col">
                    <div className="flex items-center justify-between pt-4 pe-4 ps-7">
                        {/* <a className="flex-none focus:outline-none focus:opacity-80" href="/" aria-label="Preline"> */}
                        <img className="w-40 h-auto" width="116" height="32" src="/logo.png" alt="logo" />
                        {/* </a> */}
                    </div>

                    <div className="h-full">
                        <ul className="space-y-1.5 p-4">
                            <li>
                                <button onClick={handleNewChat} className="flex items-center w-full gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                    New chat
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 border-t border-gray-200">
                            <a className="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100" href="/">
                                tenmileadmin@gmail.com
                                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                            </a>
                        </div>
                    </div>
                </nav>
            </div>

            <div className="relative h-screen w-full lg:ps-64">
                <div className="py-10 lg:py-14">
                    <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
                        <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                            Welcome to Tenmile Land
                        </h1>
                        <p className="mt-3 text-gray-600">
                            Your AI-powered Chatbot for your queries
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex h-96 justify-center items-center">
                            <div className="flex flex-col justify-center items-center space-y-2">
                                <ClipLoader color="#237e1a" loading={loading} />
                                <p>Configuring the AI model...</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="mt-10 mb-40">
                            <li className="py-2 sm:py-4">
                                <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                                    <div className="max-w-4xl flex gap-x-2 sm:gap-x-4">
                                        <img className="shrink-0 size-[38px] rounded-full" src="/bot-icon.jpg" alt="logo" />
                                        <div className="grow mt-2 space-y-3 rounded-lg bg-gray-100 px-4 py-2">
                                            <p className="text-gray-800">
                                                How can I help you?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            {messages.map((message, index) => (
                                <li key={index} className="py-2 sm:py-4">
                                    <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                                        <div className="max-w-4xl flex gap-x-2 sm:gap-x-4">
                                            {message.sender === 'bot' ? (
                                                <img className="shrink-0 size-[38px] rounded-full" src="/bot-icon.jpg" alt="Bot Icon" />
                                            ) : (
                                                <span className="shrink-0 inline-flex items-center justify-center size-[38px] rounded-full bg-gray-600">
                                                    <span className="text-sm font-medium text-white leading-none">AZ</span>
                                                </span>
                                            )}
                                            <div className={`grow space-y-2 px-4 py-2 rounded-lg ${message.sender === 'bot' ? "bg-gray-100" : "bg-green-50"}`}>
                                                <div className="markdown-body">
                                                    {message.type === "image" ?
                                                        <img src={message.content} className="max-w-full h-auto rounded-lg" alt={message.type} />
                                                        :
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || '')
                                                                    return match ? (
                                                                        <CodeBlock
                                                                            language={match[1]}
                                                                            value={String(children).replace(/\n$/, '')}
                                                                            {...props}
                                                                        />
                                                                    ) : (
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                },
                                                                img: (props) => (
                                                                    <img src={props.src} className="max-w-full h-auto rounded-lg" alt={props.alt || ''} />
                                                                ),
                                                                a: (props) => (
                                                                    <a href={props.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" >{props.children}</a>
                                                                ),
                                                                h1: (props) => (
                                                                    <h1 className="text-2xl font-bold mt-4 mb-2" >{props.children}</h1>
                                                                ),
                                                                h2: (props) => (
                                                                    <h2 className="text-xl font-bold mt-3 mb-2" >{props.children}</h2>
                                                                ),
                                                                h3: (props) => (
                                                                    <h3 className="text-lg font-bold mt-2 mb-1" >{props.children}</h3>
                                                                ),
                                                                p: (props) => <p className="mb-3" >{props.children}</p>,
                                                                ul: (props) => <ul className="list-disc ml-6 mb-2 space-y-2" >{props.children}</ul>,
                                                                ol: (props) => <ol className="list-decimal ml-6 mb-2 space-y-2" >{props.children}</ol>,
                                                                li: (props) => <li className="mb-1" >{props.children}</li>,
                                                                table: (props) => (
                                                                    <table className="border-collapse border rounded-xl border-gray-300 mb-2" >{props.children}</table>
                                                                ),
                                                                th: (props) => (
                                                                    <th className=" px-4 py-2 border-2 bg-gray-100 border-gray-300" >{props.children}</th>
                                                                ),
                                                                td: (props) => (
                                                                    <td className=" px-4 border-2 py-2 border-gray-300" >{props.children}</td>
                                                                ),
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {botLoading && (
                                <li className="py-2 sm:py-4">
                                    <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
                                        <div className="max-w-2xl flex gap-x-2 sm:gap-x-4">
                                            <img className="shrink-0 size-[38px] rounded-full" src="/bot-icon.jpg" alt="Bot Icon" />
                                            <div className="grow mt-2 space-y-3">
                                                <PulseLoader size={10} color="#237e1a" />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )}
                            <div ref={messagesEndRef} />
                        </ul>
                    )}
                </div>

                <div className="fixed bottom-0 lg:start-1/2 transform lg:-translate-x-1/3 sm:max-w-4xl w-full mx-auto z-10 p-3 sm:py-6">
                    <div className="lg:hidden flex justify-end mb-2 sm:mb-3">
                        <button type="button" className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-application-sidebar" aria-label="Toggle navigation" data-hs-overlay="#hs-application-sidebar">
                            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
                            <span>Sidebar</span>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="flex justify-center gap-3 mb-2 sm:mb-3">
                            <>
                                <button
                                    onClick={() => setInput("How have our overall sales performed in the past quarter compared to the previous year?")}
                                    type="button"
                                    className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border-1 border-gray-500 bg-green-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span>
                                        How have our overall sales performed in the past quarter compared to the previous year?
                                    </span>
                                </button>
                                <button
                                    onClick={() => setInput("Can you segment our customers based on their purchase behavior and demographics?")}
                                    type="button"
                                    className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border-1 border-gray-500 bg-green-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span>
                                        Can you segment our customers based on their purchase behavior and demographics?
                                    </span>
                                </button>
                                <button
                                    onClick={() => setInput("Which products have been the top sellers in the past month?")}
                                    type="button"
                                    className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border-1 border-gray-500 bg-green-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span>
                                        Which products have been the top sellers in the past month?
                                    </span>
                                </button>
                                <button
                                    onClick={() => setInput("How does employee productivity vary across different departments?")}
                                    type="button"
                                    className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border-1 border-gray-500 bg-green-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span>
                                        How does employee productivity vary across different departments?
                                    </span>
                                </button>
                                <button
                                    onClick={() => setInput("What is the current inventory level for our most popular products?")}
                                    type="button"
                                    className="p-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border-1 border-gray-500 bg-green-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span>
                                        What is the current inventory level for our most popular products?
                                    </span>
                                </button>

                            </>
                        </div>
                        <input
                            className="p-4 pb-12 block w-full bg-gray-100 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-green-500"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <button type="button" className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white focus:z-10 focus:outline-none focus:bg-white">
                                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                    </button>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <button type="button" className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white focus:z-10 focus:outline-none focus:bg-white">
                                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                    </button>
                                    <button onClick={handleSendMessage} className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-white bg-green-600 hover:bg-green-500 focus:z-10 focus:outline-none focus:bg-green-500">
                                        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;