#pragma once
#include <string>

using namespace std;

class CleaningRecord {
private:
    string date;
    string task;
    string notes;

public:
    CleaningRecord();
    CleaningRecord(const string& date, const string& task, const string& notes);

    string getDate() const;
    string getTask() const;
    string getNotes() const;

    void setDate(const string& date);
    void setTask(const string& task);
    void setNotes(const string& notes);
};