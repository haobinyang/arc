#include "stdafx.h"
#include <list>
#include <map>
#include <string>
#include <cstring>
#include <iostream>

using namespace std;

struct Node
{
    string name;
    string text;
    string repeat; //used for gen html mutil times
    map<string, string> attrs;
    list<Node *> children;
    Node *parent = nullptr;
};

enum ParseState
{
    STATE_INIT = 0,
    STATE_TAG_NAME,
    STATE_TAG_ID,
    STATE_TAG_CLASS,
    STATE_TAG_TEXT,
    STATE_REPEAT
};

bool is_number(char ch)
{
    return (ch >= '0' && ch <= '9');
}

bool is_alpha(char ch)
{
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

const char *default_tag_name(const string &parent_name)
{
    if (parent_name.compare("em") == 0)
    {
        return "span";
    }
    else if (parent_name.compare("ol") == 0)
    {
        return "li";
    }
    else if (parent_name.compare("ul") == 0)
    {
        return "li";
    }

    return "div";
}

const char *full_tag_name(const string &short_name)
{
    if (short_name.compare("bq") == 0)
    {
        return "blockquote";
    }

    return short_name.c_str();
}

string cut(const char *input, int begin, int end)
{
    if (end > begin)
    {
        return string(input + begin, end - begin);
    }
    else
    {
        return "";
    }
}

int parse(const char *input, Node *root)
{
    ParseState state = STATE_INIT;
    Node *cur = root;
    int index = 0, begin = 0;
    for(;;)
    {
        char ch = input[index];
        switch (state)
        {
            case STATE_INIT:
            {
                if (is_alpha(ch))
                {
                    Node *child = new Node;
                    child->parent = cur;
                    cur->children.push_back(child);
                    cur = child;

                    state = STATE_TAG_NAME;
                    begin = index;
                }
                else if (ch == '(')
                {
                    Node *child = new Node;
                    child->parent = cur;
                    cur->children.push_back(child);
                    cur = child;

                    index += parse(input + index + 1, cur) + 1;
                }
                else if (ch == '{')
                {
                    Node *child = new Node;
                    child->parent = cur;
                    cur->children.push_back(child);
                    cur = child;

                    state = STATE_TAG_TEXT;
                    begin = index + 1;
                }
                else if (ch == '#')
                {
                    Node *child = new Node;
                    child->parent = cur;
                    cur->children.push_back(child);
                    cur = child;

                    cur->name = default_tag_name(cur->parent->name);

                    state = STATE_TAG_ID;
                    begin = index + 1;
                }
                else if (ch == '.')
                {
                    Node *child = new Node;
                    child->parent = cur;
                    cur->children.push_back(child);
                    cur = child;

                    cur->name = default_tag_name(cur->parent->name);

                    state = STATE_TAG_CLASS;
                    begin = index + 1;
                }
                else if (ch == '*')
                {
                    state = STATE_REPEAT;
                    begin = index + 1;
                }
                else if (ch == '+')
                {
                    cur = cur->parent;
                }
                else if (ch == '^')
                {
                    cur = cur->parent->parent;
                }
                else if (ch == '>')
                {
                    //do nothing
                }
                else
                {
                    return index; //error
                }
                break;
            }
            case STATE_TAG_NAME:
            {
                if (is_alpha(ch) || is_number(ch) || ch == ':')
                {
                    //do nothing
                }
                else if (ch == '*')
                {
                    cur->name = cut(input, begin, index);

                    state = STATE_REPEAT;
                    begin = index + 1;
                }
                else if (ch == '#')
                {
                    cur->name = cut(input, begin, index);

                    state = STATE_TAG_ID;
                    begin = index + 1;
                }
                else if (ch == '.')
                {
                    cur->name = cut(input, begin, index);

                    state = STATE_TAG_CLASS;
                    begin = index + 1;
                }
                else if (ch == '+')
                {
                    cur->name = cut(input, begin, index);
                    cur = cur->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '^')
                {
                    cur->name = cut(input, begin, index);
                    cur = cur->parent->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '>')
                {
                    cur->name = cut(input, begin, index);

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '{')
                {
                    cur->name = cut(input, begin, index);

                    state = STATE_TAG_TEXT;
                    begin = index + 1;
                }
                else
                {
                    cur->name = cut(input, begin, index);

                    return index; //error
                }

                break;
            }
            case STATE_TAG_ID:
            {
                if (is_alpha(ch) || is_number(ch) || ch == '_' || ch == '-')
                {
                    //do nothing
                }
                else if (ch == '*')
                {
                    cur->attrs["id"] = cut(input, begin, index);

                    state = STATE_REPEAT;
                    begin = index + 1;
                }
                else if (ch == '.')
                {
                    cur->attrs["id"] = cut(input, begin, index);

                    state = STATE_TAG_CLASS;
                    begin = index + 1;
                }
                else if (ch == '+')
                {
                    cur->attrs["id"] = cut(input, begin, index);
                    cur = cur->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '^')
                {
                    cur->attrs["id"] = cut(input, begin, index);
                    cur = cur->parent->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '>')
                {
                    cur->attrs["id"] = cut(input, begin, index);

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '{')
                {
                    cur->attrs["id"] = cut(input, begin, index);

                    state = STATE_TAG_TEXT;
                    begin = index + 1;
                }
                else
                {
                    cur->attrs["id"] = cut(input, begin, index);
                    return index; //error
                }

                break;
            }
            case STATE_TAG_CLASS:
            {
                if (is_alpha(ch) || is_number(ch) || ch == '_' || ch == '-')
                {
                    //do nothing
                }
                else if (ch == '*')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);

                    state = STATE_REPEAT;
                    begin = index + 1;
                }
                else if (ch == '.')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);

                    state = STATE_TAG_CLASS;
                    begin = index + 1;
                }
                else if (ch == '+')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);
                    cur = cur->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '^')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);
                    cur = cur->parent->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '>')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '{')
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);

                    state = STATE_TAG_TEXT;
                    begin = index + 1;
                }
                else
                {
                    cur->attrs["class"] += " " + cut(input, begin, index);

                    return index; //error
                }

                break;
            }
            case STATE_TAG_TEXT:
            {
                if (ch == '}')
                {
                    cur->text = cut(input, begin, index);

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else
                {
                    //do nothing
                }

                break;
            }
            case STATE_REPEAT:
            {
                if (is_number(ch))
                {
                    //do nothing
                }
                else if (ch == '+')
                {
                    cur->repeat = cut(input, begin, index);
                    cur = cur->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '^')
                {
                    cur->repeat = cut(input, begin, index);
                    cur = cur->parent->parent;

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else if (ch == '>')
                {
                    cur->repeat = cut(input, begin, index);

                    state = STATE_INIT;
                    begin = index + 1;
                }
                else
                {
                    cur->repeat = cut(input, begin, index);

                    return index; //error
                }

                break;
            }
        }

        index++;
    }

    return index;
}

Node *parse(const char *input)
{
    Node *root = new Node;
    root->parent = root;
    parse(input, root);
    return root;
}

void travel(Node *root)
{
    if (!root) return;

    int repeat = atoi(root->repeat.c_str());
    repeat = repeat > 0 ? repeat : 1;

    if (root->name.size() > 0)
    {
        for (int i = 0; i < repeat; ++i)
        {
            cout << "<" << full_tag_name(root->name);

            for (const auto &p : root->attrs)
            {
                cout << " " << p.first << "=\"" << p.second << "\"";
            }
            cout << ">" << root->text;
            for (auto c : root->children)
            {
                travel(c);
            }

            cout << "</" << full_tag_name(root->name) << ">";
        }
    }
    else
    {
        for (int i = 0; i < repeat; ++i)
        {
            cout << root->text;
            for (auto c : root->children)
            {
                travel(c);
            }
        }
    }
}

int main()
{
    //memory leaks warnning, just for test.

    const char *input1 = "#test+.test+div#main.class1.class2.class3+{ hello guys!@#$%^&*().[] {}+(div+header>ul>li*5>a{click })*2+footer>p";
    travel(parse(input1));
    cout << "\n\n";

    const char *input2 = "{ddd}>p>{Click }+a{here}+{ to continue}";
    travel(parse(input2));
    cout << "\n\n";

    const char *input3 = "(div>dl>(dt+dd)*3)+bq>ul>.";
    travel(parse(input3));
    cout << "\n\n";

    const char *input4 = "a>b>(z+k>t)>d^c1+c2^b^a";
    travel(parse(input4));
    cout << "\n\n";

    const char *input5 = "a^^^^^^^^^^^b";
    travel(parse(input5));
    cout << "\n\n";

    const char *input6 = "div+div>p>span+em^bq";
    travel(parse(input6));
    cout << "\n\n";

    for (;;);
    return 0;
}