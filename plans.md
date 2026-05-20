-   [ ] Match plugin

    ```js
    fn getAge (name: string){
    	return match name {
    		"michael" => 40
    		"gregory" => 25
    		"john" => 32
    		"luna" => 24
    		"orago" => 21
    		"marco" => 27
    		"betty" => 96
    	}
    }

    getAge("gregory") // 25
    getAge("orago") // 21
    getAge("luna") // 24
    ```

-   [ ] async

-   [ ] error handling

    -   throw - being able to throw anywhere in the code
    -   catch - TODO

-   [ ] assert debugging plugin

    Syntax: `assert <condition>`

-   inline variable destructuring

    ```js

    let me = {
    	name: "orago",
    	age: 21,
    }

    let is_unc: me
    	|> _.age > 20 // true

    fn isAuthenticated(name){
    	return name == "orago"
    }

    let is_admin: me
    	|> isAuthenticated(_.name)
    ```
