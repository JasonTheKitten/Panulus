export default class EditTracker {

  #projectOptions;

  constructor(projectOptions) {
    this.#projectOptions = projectOptions;
  }

  // TODO: What if an edit is destructive and cannot be undone?

  undo() {
    const editHistory = this.#getEditHistory();
    const editHistoryCopy = [...editHistory];
    const lastEdit = editHistoryCopy.pop();
    if (lastEdit) {
      lastEdit.undo();
      this.#setEditHistory(editHistoryCopy);
      this.#setEditFuture([lastEdit, ...this.#getEditFuture()]);
    }
  }

  redo() {
    const editFuture = this.#getEditFuture();
    const editFutureCopy = [...editFuture];
    const nextEdit = editFutureCopy.shift();
    if (nextEdit) {
      nextEdit.redo();
      this.#setEditFuture(editFutureCopy);
      this.#setEditHistory(this.#limitHistoryStack([...this.#getEditHistory(), nextEdit]));
    }
  }

  pushEdit(edit) {
    edit.redo();
    this.#setEditHistory([...this.#getEditHistory(), edit]);
    this.#setEditFuture([]);
  }

  #getEditHistory() {
    return this.#projectOptions.get("edittracker.flathistory", []);
  }

  #setEditHistory(editHistory) {
    this.#projectOptions.set("edittracker.flathistory", editHistory);
  }

  #getEditFuture() {
    return this.#projectOptions.get("edittracker.flatfuture", []);
  }

  #setEditFuture(editFuture) {
    this.#projectOptions.set("edittracker.flatfuture", editFuture);
  }

  #limitHistoryStack(editHistory) {
    const maxHistoryLength = this.#projectOptions.get("edittracker.maxhistorylength", 100);
    return editHistory.slice(-maxHistoryLength);
  }

}