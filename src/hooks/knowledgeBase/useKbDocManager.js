import { useState, useCallback } from "react";
import { useSocket } from "../../contexts/SocketProvider";

export const useKbDocManager = (backendUrl, uid, showSnackbar, selectedKb) => {
  const { socket } = useSocket();
  const [isDocManagerLoading, setIsDocManagerLoading] = useState(true);
  const [kbDocs, setKbDocs] = useState({});
  const kbId = selectedKb ? selectedKb.id : null;

  const updateDocumentState = useCallback(
    (dataToUpdate) => {
      if (!dataToUpdate) {
        return;
      }
      const { id, documentsToChange } = dataToUpdate;
      setKbDocs((prevDocs) => {
        const existingDocs = prevDocs[kbId] || [];
        const docToUpdate = existingDocs.find((doc) => doc.id === id);

        if (!docToUpdate) {
          console.error("Document not found:", id);
          return prevDocs;
        }

        const updatedDoc = { ...docToUpdate };

        documentsToChange.forEach((page) => {
          const existingPageIndex = updatedDoc.content.findIndex(
            (p) => p.metadata.sourceURL === page.source
          );

          if (existingPageIndex !== -1) {
            updatedDoc.content[existingPageIndex].content = page.content;
          }
        });

        const updatedDocs = existingDocs.map((doc) =>
          doc.id === id ? updatedDoc : doc
        );

        return {
          ...prevDocs,
          [kbId]: updatedDocs,
        };
      });
    },
    [kbId]
  );

  const updateLocalStorage = useCallback((dataToUpdate) => {
    const { kbId, id, pagesToChange } = dataToUpdate;
    const savedData = JSON.parse(localStorage.getItem("documents")) || {};
    savedData[kbId] = savedData[kbId] || [];

    const docIndex = savedData[kbId].findIndex((doc) => doc.id === id);
    if (docIndex !== -1) {
      const updatedDoc = { ...savedData[kbId][docIndex] };
      pagesToChange.forEach((page) => {
        const existingPageIndex = updatedDoc.content.findIndex(
          (p) => p.source === page.source
        );
        if (existingPageIndex !== -1) {
          updatedDoc.content[existingPageIndex] = page;
        } else {
          updatedDoc.content.push(page);
        }
      });
      savedData[kbId][docIndex] = updatedDoc;
    } else {
      console.error("Document not found in localStorage:", id);
    }

    localStorage.setItem("documents", JSON.stringify(savedData));
  }, []);

  const handleSave = (dataToUpdate) => {
    saveKbDoc(dataToUpdate);
    updateLocalStorage(dataToUpdate);
  };

  const embedKbDoc = async (docId) => {
    try {
      setIsDocManagerLoading(true);
      socket.emit("process_document", {
        uid: uid,
        id: docId,
        kbId: kbId,
        dbName: process.env.REACT_APP_DB_NAME,
        operation: "embed",
      });

      socket.on("process_started", (data) => {
        console.log("Processing started with ID:", data.process_id);
      });

      socket.on("process_update", (data) => {
        console.log("Process update:", data.status);
      });

      socket.on("process_complete", (data) => {
        showSnackbar("Document embedded successfully", "success");
        setIsDocManagerLoading(false);
        console.log("Processing completed:", data.kb_doc);
        return data.kb_doc;
      });

      socket.on("process_error", (data) => {
        console.error("Processing error:", data.message);
      });
    } catch (error) {
      console.error("Error embedding text doc:", error);
      showSnackbar("Error embedding text doc", "error");
      setIsDocManagerLoading(false);
      return null;
    }
  };

  const saveKbDoc = async (docData) => {
    try {
      setIsDocManagerLoading(true);
      socket.emit("process_document", {
        ...docData,
        dbName: "paxxium",
        operation: "save",
      });
      showSnackbar("Document saved successfully", "success");
      setIsDocManagerLoading(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Error saving text doc", "error");
      setIsDocManagerLoading(false);
      throw error;
    }
  };

  const fetchKbDocs = useCallback(
    async (kbId) => {
      try {
        setIsDocManagerLoading(true);
        const response = await fetch(`${backendUrl}/kb/${kbId}/documents`, {
          method: "GET",
          headers: {
            uid: uid,
            dbName: process.env.REACT_APP_DB_NAME,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setIsDocManagerLoading(false);
        setKbDocs((prevDocuments) => ({
          ...prevDocuments,
          [kbId]: data.documents,
        }));
      } catch (error) {
        showSnackbar("Error fetching documents", "error");
        setIsDocManagerLoading(false);
        throw error;
      }
    },
    [backendUrl, showSnackbar, uid]
  );

  const deleteKbDoc = async (kbId, docId) => {
    try {
      setIsDocManagerLoading(true);
      const response = await fetch(`${backendUrl}/kb/${kbId}/documents`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          uid: uid,
          dbName: process.env.REACT_APP_DB_NAME,
        },
        body: JSON.stringify({ docId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setIsDocManagerLoading(false);
      setKbDocs((prevDocs) => {
        const updatedKbDocs = prevDocs[kbId].filter((doc) => doc.id !== docId);
        return {
          ...prevDocs,
          [kbId]: updatedKbDocs,
        };
      });

      const savedData = JSON.parse(localStorage.getItem("documents")) || {};
      const updatedKbDocs =
        savedData[kbId]?.filter((doc) => doc.id !== docId) || [];
      localStorage.setItem(
        "documents",
        JSON.stringify({ ...savedData, [kbId]: updatedKbDocs })
      );
    } catch (error) {
      showSnackbar("Error deleting document", "error");
      setIsDocManagerLoading(false);
      throw error;
    }
  };

  const deleteKbDocPage = async (kbId, docId, pageSource) => {
    try {
      setIsDocManagerLoading(true);
      const response = await fetch(`${backendUrl}/kb/${kbId}/documents/page`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          uid: uid,
          dbName: process.env.REACT_APP_DB_NAME,
        },
        body: JSON.stringify({ docId, pageSource }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete document page");
      }

      setIsDocManagerLoading(false);
      setKbDocs((prevDocs) => {
        const updatedKbDocs = prevDocs[kbId].map((doc) => {
          if (doc.id === docId) {
            return {
              ...doc,
              content: doc.content.filter(
                (page) => page.metadata.sourceURL !== pageSource
              ),
            };
          }
          return doc;
        });
        return {
          ...prevDocs,
          [kbId]: updatedKbDocs,
        };
      });

      // Update localStorage
      const savedData = JSON.parse(localStorage.getItem("documents")) || {};
      const updatedKbDocs =
        savedData[kbId]?.map((doc) => {
          if (doc.id === docId) {
            return {
              ...doc,
              content: doc.content.filter(
                (page) => page.metadata.sourceURL !== pageSource
              ),
            };
          }
          return doc;
        }) || [];
      localStorage.setItem(
        "documents",
        JSON.stringify({ ...savedData, [kbId]: updatedKbDocs })
      );
    } catch (error) {
      showSnackbar("Error deleting document page", "error");
      setIsDocManagerLoading(false);
      throw error;
    }
  };

  return {
    kbDocs,
    setKbDocs,
    fetchKbDocs,
    deleteKbDoc,
    deleteKbDocPage,
    handleSave,
    embedKbDoc,
    isDocManagerLoading,
    updateDocumentState,
  };
};
