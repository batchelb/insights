with open('books_chapter.txt') as file:
    lines = file.readlines()
    lines = [x.strip() for x in lines]
    json_string = '['
    for line in lines:
        line = line.split(',')
        json_string += '{{book:{0},chapter:{1}}},'.format(line[0],line[1])
    json_string = json_string[:-1] + ']'
    print(json_string)