#pragma once
#include <string>

using namespace std;

class HealthNote {
private:
    string date;
    string chickenName;
    string note;

public:
    HealthNote();
    HealthNote(const string& date, const string& chickenName, const string& note);

    string getDate() const;
    string getChickenName() const;
    string getNote() const;

    void setDate(const string& date);
    void setChickenName(const string& chickenName);
    void setNote(const string& note);
};