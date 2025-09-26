// src/comp/RequireOwnership.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import { useUser } from '../context/UserContext';

export default function RequireOwnership({ resource, ownerField = 'author', children }) {
  // resource: 'comic' | 'series'
  const { user } = useUser();
  const { comicId, seriesId } = useParams();
  const id = resource === 'comic' ? comicId : seriesId;

  const [ok, setOk] = useState(null); // null=טוען, true=מורשה, false=אסור

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!user) { setOk(false); return; }
      try {
        const url =
          resource === 'comic'
            ? `${API_BASE_URL}/api/comics/${id}`
            : `${API_BASE_URL}/api/series/${id}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) { setOk(false); return; }
        const data = await res.json();
        const ownerId =
          data?.[ownerField]?._id || data?.[ownerField] || data?.author?._id || data?.userId || data?.ownerId;
        setOk(String(ownerId) === String(user._id));
      } catch {
        setOk(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user, id, resource, ownerField]);

  if (ok === null) return <div className="text-muted p-3">טוען…</div>;
  if (!ok) return <Navigate to="/login" replace />; // או: <Navigate to="/403" replace />

  return children;
}
