#pragma once
#include <string>

using namespace std;

class FeedRecord {
private:
    string date;
    string feedType;
    double quantity;
    double cost;

public:
    FeedRecord();
    FeedRecord(const string& date, const string& feedType, double quantity, double cost);

    string getDate() const;
    string getFeedType() const;
    double getQuantity() const;
    double getCost() const;

    void setDate(const string& date);
    void setFeedType(const string& feedType);
    void setQuantity(double quantity);
    void setCost(double cost);
};