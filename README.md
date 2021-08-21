#hatchways backend

This server is set to make tag requests separately and then combine post results into an array. An array cache holds post ids so there are no duplicates. The array of posts by tags are then sorted by the sortBy arg or id by default. Lastly, the order is applied only if the order arg is not asc by reversing the post array.
