#pragma once
#include <string>
#include <vector>

using namespace std;

class Utils {
public:
    static vector<string> split(const string& line, char delimiter);
    static string trim(const string& str);
    static int toInt(const string& str);
    static double toDouble(const string& str);
    static string escapeCSV(const string& value);
};