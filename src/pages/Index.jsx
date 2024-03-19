import React, { useState, useEffect } from "react";
import { Box, Heading, Textarea, Button, VStack, HStack, IconButton, useToast } from "@chakra-ui/react";
import { FaPlus, FaTrash, FaVolumeUp } from "react-icons/fa";

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const toast = useToast();

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = async () => {
    if (newNote.trim() !== "") {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newNote }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const note = {
          id: Date.now(),
          text: newNote,
          audioUrl: data.audioUrl,
        };
        setNotes([...notes, note]);
        setNewNote("");
        toast({
          title: "Note added",
          description: "Your note has been added and TTS has been generated.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error adding note",
          description: error.message,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    toast({
      title: "Note deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePlayAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <Box maxWidth="600px" margin="auto" p={4}>
      <Heading as="h1" size="xl" textAlign="center" mb={8}>
        Notes App with TTS
      </Heading>
      <VStack spacing={4} align="stretch">
        <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter a new note..." size="lg" />
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleAddNote}>
          Add Note
        </Button>
        {notes.map((note) => (
          <HStack key={note.id} spacing={4} align="center">
            <Box flex={1} p={4} borderWidth={1} borderRadius="md">
              {note.text}
            </Box>
            <IconButton icon={<FaVolumeUp />} aria-label="Play Audio" onClick={() => handlePlayAudio(note.audioUrl)} />
            <IconButton icon={<FaTrash />} aria-label="Delete Note" onClick={() => handleDeleteNote(note.id)} />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default Index;
