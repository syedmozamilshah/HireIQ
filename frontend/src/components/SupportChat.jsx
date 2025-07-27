import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((store) => store.auth);

    const user_id = user?._id || "guest_user";
    const name = user?.fullname || "guest_user";

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const newUserMsg = {
            from: "user",
            text: userInput,
            time: timestamp,
        };

        setChatHistory((prev) => [...prev, newUserMsg]);
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8000/chat", {
                user_id,
                name,
                message: userInput,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: false
            });

            const botResponse = {
                from: "bot",
                text: res.data.response,
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            setChatHistory((prev) => [...prev, botResponse]);
            setUserInput("");
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center shadow-xl z-50 hover:bg-blue-700 transition hover:scale-105 cursor-pointer"
            >
                💬
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-28 right-8 w-96 h-[450px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <span className="text-lg">Career Support Chat</span>
                                <button
                                    onClick={toggleChat}
                                    className="text-white hover:text-gray-200 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                            {chatHistory.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.from === "user" ? 50 : -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm ${msg.from === "user"
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[11px] text-gray-500 mt-1 px-1">
                                        {msg.time}
                                    </span>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex items-center space-x-2 mt-2">
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 text-sm p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="px-5 py-3 text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <span>Send</span>
                                    {loading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : null}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportChat;
