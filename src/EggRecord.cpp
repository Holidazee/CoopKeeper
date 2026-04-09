#include "EggRecord.h"

EggRecord::EggRecord() : date(""), eggCount(0), notes("") {
}

EggRecord::EggRecord(string date, int eggCount, string notes)
    : date(date), eggCount(eggCount), notes(notes) {
}

string EggRecord::getDate() const {
    return date;
}

int EggRecord::getEggCount() const {
    return eggCount;
}

string EggRecord::getNotes() const {
    return notes;
}

void EggRecord::setDate(const string& date) {
    this->date = date;
}

void EggRecord::setEggCount(int eggCount) {
    this->eggCount = eggCount;
}

void EggRecord::setNotes(const string& notes) {
    this->notes = notes;
}