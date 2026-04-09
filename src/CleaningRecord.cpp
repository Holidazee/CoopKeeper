#include "CleaningRecord.h"

CleaningRecord::CleaningRecord() : date(""), task(""), notes("") {
}

CleaningRecord::CleaningRecord(const string& date, const string& task, const string& notes)
    : date(date), task(task), notes(notes) {
}

string CleaningRecord::getDate() const {
    return date;
}

string CleaningRecord::getTask() const {
    return task;
}

string CleaningRecord::getNotes() const {
    return notes;
}

void CleaningRecord::setDate(const string& date) {
    this->date = date;
}

void CleaningRecord::setTask(const string& task) {
    this->task = task;
}

void CleaningRecord::setNotes(const string& notes) {
    this->notes = notes;
}