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
        self.author = obj.get('Author') or obj.get('Author / Institution')
        self.body = obj.get('Body')
        self.resource_link = obj.get('Resource Link')
        self.resource_type = obj.get('Resource Type')
        self.climate_topics = obj.get('Climate Topics')

    def to_md(self):
        s = '---\nlayout: resource\n'
        if self.title:
            s += 'title: "{}"\n'.format(
                self.title.replace('"', '\\"'))
        if self.author:
            s += 'author: "{}"\n'.format(
                self.author.replace('"', '\\"'))
        if self.resource_link:
            s += 'resource_link: "{}"\n'.format(
                self.resource_link.replace('"', '\\"'))
        if self.resource_type:
            s += 'resource_type: "{}"\n'.format(
                self.resource_type.replace('"', '\\"'))
        if self.climate_topics:
            s += 'climate_topics: "{}"\n'.format(
                self.climate_topics.replace('"', '\\"'))
        s += '---\n'

        if self.body:
            s += '\n{}'.format(self.body)

        return s


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
