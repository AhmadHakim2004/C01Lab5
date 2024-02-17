//#region TEST CASES
test("1+2=3, empty array is empty", () => {
	expect(1 + 2).toBe(3);
	expect([].length).toBe(0);
});

const SERVER_URL = "http://localhost:4000";
const ORIGINAL_TITLE = "OriginalTitle";
const ORIGINAL_CONTENT = "OriginalContent";

test("/postNote - Post a note", async () => {
  const title = "NoteTitleTest";
  const content = "NoteTitleContent";

  const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });

  const postNoteBody = await postNoteRes.json();

  expect(postNoteRes.status).toBe(200);
  expect(postNoteBody.response).toBe("Note added succesfully.");
});

test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
  await verifyGetAllNotes(0);
});
  
test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
  await verifyGetAllNotes(2);
});
  
test("/deleteNote - Delete a note", async () => {
  const insertedId = await clearAndPostNote();

  const deleteNoteRes = await deleteNote(insertedId);
  const deleteNoteBody = await deleteNoteRes.json();

  expect(deleteNoteRes.status).toBe(200);
  expect(deleteNoteBody.response).toBe(`Document with ID ${insertedId} deleted.` );
});
  
test("/patchNote - Patch with content and title", async () => {
  await verifyPatchNote({title: "TestTitle", content: "TestContent"});
});
  
test("/patchNote - Patch with just title", async () => {
  await verifyPatchNote({title: "TestTitle"});
});
  
test("/patchNote - Patch with just content", async () => {
  await verifyPatchNote({content: "TestContent"});
});
  
test("/deleteAllNotes - Delete one note", async () => {
	await verifyDeleteAllNotes(1);
});
  
test("/deleteAllNotes - Delete three notes", async () => {
	await verifyDeleteAllNotes(3);
});
  
test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
  const insertedId = await clearAndPostNote();
  const redColor = "#FF0000"

  const updateNoteColorRes = await updateNoteColor(insertedId, redColor);
  const updateNoteColorBody = await updateNoteColorRes.json();

  const updatedNote = await getSingleNoteAdded();

  expect(updateNoteColorRes.status).toBe(200);
  expect(updateNoteColorBody.message).toBe('Note color updated successfully.');
  expect(updatedNote.color).toBe(redColor);
});
//#endregion

//#region API CALLS
async function getAllNotes() {
  return await fetch(`${SERVER_URL}/getAllNotes`);
}

async function getSingleNoteAdded(){
  const getAllNotesRes = await getAllNotes();
  const getAllNotesBody = await getAllNotesRes.json();
  return getAllNotesBody.response[0];
}

async function postNote(title = "OriginalTitle", content = "OriginalContent") {
  return await fetch(`${SERVER_URL}/postNote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });
}

async function clearAndPostNote(title = ORIGINAL_TITLE, content = ORIGINAL_CONTENT) {
  await deleteAllNotes();
  const postNoteRes = await postNote(title, content);
  const postNoteBody = await postNoteRes.json();
  return postNoteBody.insertedId;
}

async function clearAndPostNotes(notesToAddCount) {
  await deleteAllNotes();

  for (let i = 0; i < notesToAddCount; i++) {
    await postNote();
  }
}

async function deleteNote(id) {
  return await fetch(`${SERVER_URL}/deleteNote/${id}`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
  });
}

async function patchNote(id, body) {
  return await fetch(`http://localhost:4000/patchNote/${id}`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function deleteAllNotes() {
  return await fetch(`${SERVER_URL}/deleteAllNotes`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
  });
}

async function updateNoteColor(id, color) {
  return await fetch(`http://localhost:4000/updateNoteColor/${id}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ color }),
  });
}
//#endregion

//#region VERIFIERS
async function verifyGetAllNotes(expectedNotesCount){
  await clearAndPostNotes(expectedNotesCount);

  const getAllNotesRes =  await getAllNotes();
  const getAllNotesBody = await getAllNotesRes.json();

  expect(getAllNotesRes.status).toBe(200);
  expect(getAllNotesBody.response.length).toBe(expectedNotesCount);
}

async function verifyDeleteAllNotes(expectedNotesCount){
  await clearAndPostNotes(expectedNotesCount);

  const deleteAllNotesRes =  await deleteAllNotes();
  const deleteAllNotesBody = await deleteAllNotesRes.json();

  expect(deleteAllNotesRes.status).toBe(200);
  expect(deleteAllNotesBody.response).toBe(`${expectedNotesCount} note(s) deleted.`);
}

async function verifyPatchNote(body){
  const insertedId = await clearAndPostNote();

  const patchNoteRes = await patchNote(insertedId, body);
  const patchNoteBody = await patchNoteRes.json();

  const updatedTitle = body.title ?? ORIGINAL_TITLE;
  const updatedContent = body.content ?? ORIGINAL_CONTENT;
  const updatedNote = await getSingleNoteAdded();

  expect(patchNoteRes.status).toBe(200);
  expect(patchNoteBody.response).toBe(`Document with ID ${insertedId} patched.` );
  expect(updatedNote.title).toBe(updatedTitle);
  expect(updatedNote.content).toBe(updatedContent);
}
//#endregion