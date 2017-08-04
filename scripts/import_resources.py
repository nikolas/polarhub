#!/usr/bin/env python3
import csv
import re


def slugify(s):
    s = s.lower()
    for c in [' ', '_', '.', '/']:
        s = s.replace(c, '-')
    s = re.sub('\W', '-', s)
    s = re.sub('-+', '-', s)
    s = re.sub(r'\s+', ' ', s)
    return s


class Resource:
    additional_resources = ''
    all_taxonomy_terms = ''
    announcement = ''
    audience = ''
    author = ''
    body = ''
    climate_topics = ''
    date_of_issue = ''
    description = ''
    key_personnel = ''
    learn_more_link = ''
    primary_image = ''
    project_landing_page_image = ''
    project_lead = ''
    project_url = ''
    resource_link = ''
    resource_type = ''
    tagline = ''
    tags = ''
    title = ''
    type_ = ''

    def __init__(self, obj):
        self.title = obj.get('Title')

    def to_md(self):
        return '\n'.join([
            '---',
            'layout: resource',
            'title: "{}"'.format(self.title),
            '---',
        ])


def main():
    with open('./scripts/resources.csv') as csvfile:
        reader = csv.reader(csvfile)

        header = []
        resources = []
        for i, row in enumerate(reader):
            if i == 0:
                header = row
            else:
                resource = Resource(dict(zip(header, row)))
                resources.append(resource)

        for r in resources:
            filename = slugify(r.title)
            filename = './_resources/{}.md'.format(slugify(r.title))
            out = open(filename, 'w')
            out.write(r.to_md())
            out.close()
            print('Wrote to {}'.format(filename))


if __name__ == '__main__':
    main()
