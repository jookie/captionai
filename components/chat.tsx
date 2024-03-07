"use client";

import { api } from "../convex/_generated/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";

import { AddIdentity } from "./convex-chatgpt/AddIdentity";

import { Thread, UIMessage } from "../components/convex-chatgpt/Thread";


import { useEffect  , useState, useMemo } from "react";

export default function Home() {
  const { loadMore, results, status } = usePaginatedQuery(
    api.messages.list,
    {},
    {
      initialNumItems: 100,
    }
  );
  const messages = useMemo(() => results.slice().reverse(), [results]);

  const [newThreadId, setNewThreadId] = useState<Id<"threads">>();
  const createThread = useMutation(api.threads.add);
  useEffect(() => {
    if (newThreadId && messages.find((m) => newThreadId === m.threadId))
      setNewThreadId(undefined);
  }, [newThreadId, messages]);

  return (
    <main>
      <h1>Convex Chat-GPT</h1>
      <p>Disclaimer: Any identities here are not real. Just robots.</p>
    
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(100)}>Load More</button>
      )}
      {messages
        .reduce<UIMessage[][]>((threads, message) => {
          const thread = threads.find(
            (threadMessages) => threadMessages[0].threadId === message.threadId
          );
          if (thread) {
            thread.push(message);
          } else {
            threads.push([message]);
          }
          return threads;
        }, [])
        .map((messages, index, threads) => (
          <details
            key={"thread" + index}
            open={!newThreadId && index === threads.length - 1}
          >
            <summary>{messages[0]?.body?.substring(0, 100)}...</summary>
            <Thread messages={messages} threadId={messages[0].threadId} />
          </details>
        ))}
      {newThreadId && (
        <>
          <Thread messages={[]} threadId={newThreadId} />
        </>
      )}
      <button className="x-4 py-2 text-white bg-[#5a5cd1] rounded-md hover:bg-[#3f4194] focus:outline-none focus:ring"
        onClick={(e) => {
          e.preventDefault();
          createThread().then(setNewThreadId);
        }}
        disabled={!!newThreadId}
      >
        Start New Thread
      </button>
      <AddIdentity />
    </main>
  );
}
