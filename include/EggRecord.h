#pragma once
#include <string>
using namespace std;

class EggRecord {
private:
    string date;
    int eggCount;
    string notes;

public:
    EggRecord();
    EggRecord(string date, int eggCount, string notes);

    string getDate() const;
    int getEggCount() const;
    string getNotes() const;

    void setDate(const string& date);
    void setEggCount(int eggCount);
    void setNotes(const string& notes);
};