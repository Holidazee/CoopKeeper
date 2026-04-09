#include "HealthNote.h"

HealthNote::HealthNote() : date(""), chickenName(""), note("") {
}

HealthNote::HealthNote(const string& date, const string& chickenName, const string& note)
    : date(date), chickenName(chickenName), note(note) {
}

string HealthNote::getDate() const {
    return date;
}

string HealthNote::getChickenName() const {
    return chickenName;
}

string HealthNote::getNote() const {
    return note;
}

void HealthNote::setDate(const string& date) {
    this->date = date;
}

void HealthNote::setChickenName(const string& chickenName) {
    this->chickenName = chickenName;
}

void HealthNote::setNote(const string& note) {
    this->note = note;
}