#pragma once
#include <string>

using namespace std;

class Chicken {
private:
    string name;
    string breed;
    int age;
    string notes;

public:
    Chicken();
    Chicken(const string& name, const string& breed, int age, const string& notes);

    string getName() const;
    string getBreed() const;
    int getAge() const;
    string getNotes() const;

    void setName(const string& name);
    void setBreed(const string& breed);
    void setAge(int age);
    void setNotes(const string& notes);
};