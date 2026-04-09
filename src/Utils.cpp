#include "Utils.h"
#include <sstream>

vector<string> Utils::split(const string& line, char delimiter) {
    vector<string> result;
    string token;
    stringstream ss(line);

    while (getline(ss, token, delimiter)) {
        result.push_back(token);
    }

    return result;
}

string Utils::trim(const string& str) {
    size_t start = str.find_first_not_of(" \t");
    size_t end = str.find_last_not_of(" \t");

    if (start == string::npos) return "";
    return str.substr(start, end - start + 1);
}

int Utils::toInt(const string& str) {
    try {
        return stoi(str);
    }
    catch (...) {
        return 0;
    }
}

double Utils::toDouble(const string& str) {
    try {
        return stod(str);
    }
    catch (...) {
        return 0.0;
    }
}

string Utils::escapeCSV(const string& value) {
    string escaped = value;
    size_t pos = 0;

    while ((pos = escaped.find('"', pos)) != string::npos) {
        escaped.insert(pos, 1, '"');
        pos += 2;
    }

    return "\"" + escaped + "\"";
}