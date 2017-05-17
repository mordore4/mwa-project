(function($, window, document) {

    var manifest = {
        "lang": "en-US",
        "start_url": "/",
        "display": "standalone"
    };

    function showManifest() {
        var json_manifest = JSON.stringify(manifest, null, 2);
        $("#manifest").text(json_manifest);
    }

    function changeManifest() {
        var jquery_element = $(this);
        var name = jquery_element.attr("name");
        var value = jquery_element.val();
        var split_name = name.split("-");
        if (value === "") {
            delete manifest[split_name[0]]
        }
        else
        {
            if (split_name[1] == undefined)
            {
                manifest[name] = value;
            }
            else
            {
                if (manifest[split_name[0]] == undefined)
                {
                    manifest[split_name[0]] = [];
                    manifest[split_name[0]][0] = {};
                }

                manifest[split_name[0]][0][split_name[1]] = value;
            }
        }

        if(jquery_element.attr("type") === "checkbox")
        {
            if (!jquery_element.is(":checked")) {
                delete manifest[split_name[0]]
            }
            else
            {
                manifest[name] = true;
            }
        }

        showManifest();
    }

    $(function() {
        showManifest();
        $("form").on("change", "input, select", changeManifest);
    });

}(window.jQuery, window, document));