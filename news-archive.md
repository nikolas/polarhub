---
layout: page
title: News Archive
permalink: /news-archive/
---

All of the latest in PoLAR Partnership news, events, and products.

{% assign items = site.news_items | sort: 'date' | reverse %}
{% for item in items %}
<div class="media">
    <img class="d-flex mr-3" src="{{ item.image | relative_url }}">
    <div class="media-body">
        <h5 class="mt-0">
            <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
        </h5>
        {{ item.description }}
    </div>
</div>
{% endfor %}
