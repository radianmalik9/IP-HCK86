import { useEffect } from 'react';

export default function useDocumentTitle(title, keepOnUnmount = false) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      if (!keepOnUnmount) document.title = prev;
    };
  }, [title, keepOnUnmount]);
}
