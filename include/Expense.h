#pragma once
#include <string>

using namespace std;

class Expense {
private:
    string date;
    string category;
    string description;
    double amount;

public:
    Expense();
    Expense(const string& date, const string& category, const string& description, double amount);

    string getDate() const;
    string getCategory() const;
    string getDescription() const;
    double getAmount() const;

    void setDate(const string& date);
    void setCategory(const string& category);
    void setDescription(const string& description);
    void setAmount(double amount);
};