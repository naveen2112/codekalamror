$(document).on('turbolinks:load', function () {
    (function ($) {
        $.fn.customSelect = function (options) {
            // Default options
            var settings = $.extend({
                btnLabel: "DropDown",
                AppendLimitText: "selected",
                SearchPlaceHolder: "Search",
                AppendLimit: 2,
                DropDownList: [],
                selectedArray: [],
                AppendText: false,
                renderId: $(this).attr("id"),
                parentClass: $(this).attr("id") + 'DropdownParentId',
                closeIcon: false,
                inputType: "checkbox",
                defaultSelectArray: [],
                groupList: true,
                commonGroup: '',
            }, options);
            $('#' + settings.renderId).wrap('<div class = "' + settings.parentClass + '"></div>');
            $('#' + settings.renderId).hide();

            //create dropdown
            function createDropdown(data) {
                var inputType = settings.inputType;
                var list = "";
                $.each(data, function (key, dataList) {
                    var addGroupInput = "";
                    if (inputType === "checkbox") {
                        addGroupInput = '<input class = "addGroupInput" value = "' + dataList.value + '" type = "checkbox" />';
                    }
                    if (settings.groupList) {
                        list = list + '<div class = "group-header ' + dataList.className + '" >' + addGroupInput + '<a class = "btn header-label collapsed" data-toggle = "collapse" data-target = "#collapse' + dataList.value + settings.renderId + '" aria-expanded = "false" aria-controls = "dataTarget' + dataList.value + settings.renderId + '">' + dataList.name + '</a></div><div class = "customDropdown-group collapse" id = "collapse' + dataList.value + settings.renderId + '" aria-labelledby = "#heading' + key + settings.renderId + '">';
                    } else {
                        list = list + '<div style="display: none" class = "group-header ' + dataList.className + '" >' + addGroupInput + '<a class = "btn header-label collapsed" data-toggle = "collapse" data-target = "#collapse' + dataList.value + settings.renderId + '" aria-expanded = "false" aria-controls = "dataTarget' + dataList.value + settings.renderId + '">' + dataList.name + '</a></div><div class = "customDropdown-group collapse" id = "collapse' + dataList.value + settings.renderId + '" aria-labelledby = "#heading' + key + settings.renderId + '">';
                        settings.commonGroup = dataList.value;
                    }
                    var listItem = "";
                    $.each(dataList[dataList.name], function (k, list) {
                        listItem = listItem + ('<a class = "dropdown-item ' + list.className + '"><input id = "' + inputType + list.value + settings.renderId + '" name = "dropdown-input" type="' + inputType + '" value = "' + list.value + '" /><label for = "' + inputType + list.value + settings.renderId + '">' + list.name + '</label></a>');
                    });
                    list = list + listItem + ('</div>');
                });
                return list;
            }

            // Apply options
            for (var key in options) {
                var customDropdown = "";
                var parentClass = settings.parentClass;
                if (key === "DropDownList") {
                    $('.' + parentClass).empty()
                    $('.' + parentClass).append('<div class = "custom-dropdown-select gfk-custom-' + settings.inputType + '-group"><label class = "category-label" for = "multiselect">' + settings.btnLabel + '</label><span class = "multiselect-btn dropdown-toggle" data-toggle = "dropdown" aria-haspopup="true" aria-expanded = "false" id = "' + settings.renderId + 'DropDownButton"></span><div class = "dropdown-menu custom-dropdownmenu"><div class = "input-group"><input type = "search" id = "' + settings.renderId + 'search" class = "search-input" placeholder = "' + settings.SearchPlaceHolder + '" /><span class = "input-group-addon input-group-addon-btn bg-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="none" fill-rule="evenodd" stroke="#307fe2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" transform="translate(1 1)"><circle cx="6.667" cy="6.667" r="6.667"/><path d="M16 16l-4.622-4.622"/></g></svg></span></div><div class = "collapseContent"></div></div>');
                    customDropdown = createDropdown(settings.DropDownList);
                }
                $('.' + parentClass + ' .custom-dropdownmenu .collapseContent').append(customDropdown);
            }
            var renderDropdown = ('.' + settings.parentClass + ' .custom-dropdownmenu');
            //open first collapse
            $('.collapseContent').each(function (index) {
                $(this).find(".customDropdown-group:first").addClass('show');
                $(this).find('.group-header:first .header-label').removeClass('collapsed');
            });
            if (settings.defaultSelectArray.length !== 0) {
                defaultSelectFunction(settings.defaultSelectArray);
            }
            //open Dropdown
            $(renderDropdown).on('click', function () {
                $(renderDropdown).addClass('open');
            });
            $('.' + settings.parentClass + ' .custom-dropdown-select .multiselect-btn').on('click', function(event) {
                if ($(renderDropdown).hasClass('open')) {
                    $(renderDropdown).removeClass('open');
                    $(renderDropdown).removeClass('show');
                    event.stopPropagation();
                } else {
                    $(renderDropdown).addClass('open');
                    $(renderDropdown).addClass('show');
                    event.stopPropagation();
                }
            });
            //close Dropdown
            $(renderDropdown + ' .multiselect-btn').on('click', function (event) {
                if ($(renderDropdown).hasClass('open')) {
                    $(renderDropdown).removeClass('open');
                    $(renderDropdown).removeClass('show');
                    event.stopPropagation();
                }
            });
            $(document).on("click", function (event) {
                if ((!$(event.target).closest(renderDropdown).length) && ($(renderDropdown).hasClass('open') || $(renderDropdown).hasClass('show'))) {
                    $(renderDropdown).removeClass('open');
                    $(renderDropdown).removeClass('show');
                    let event = new Event("custom-event:closed", {
                        bubbles: true, // only bubbles and cancelable
                    });
                   if(document.querySelector('#' + settings.renderId) != null) {
                       document.querySelector('#' + settings.renderId).dispatchEvent(event)
                   }
                }
            });
            //multi
            $('.' + settings.parentClass + ' .custom-dropdownmenu .addGroupInput').on("change", function () {
                var $inputboxes = $(this).parent().next(".customDropdown-group").find("input");
                if ($(this).prop('checked')) {
                    $inputboxes.prop('checked', true);
                    $inputboxes.parent().addClass('checkedList');
                } else {
                    $inputboxes.prop('checked', false);
                    $inputboxes.parent().removeClass('checkedList');
                }
            });
            InputCheck();

            function InputCheck() {
                $('.' + settings.parentClass + ' .custom-dropdownmenu .customDropdown-group input').on("change", function () {
                    var $outerdiv = $(this).parent().parent();
                    var $inputbox = $outerdiv.find("input");
                    var $checkboxesTotal = $inputbox.length;
                    var countCheckedCheckboxes = $inputbox.filter(':checked').length;
                    if (countCheckedCheckboxes === $checkboxesTotal) {
                        $outerdiv.prev().find("input").prop('checked', true);
                    } else {
                        $outerdiv.prev().find("input").prop('checked', false);
                    }
                    AddCheck();
                    var selectedValue = [];
                    createArray(selectedValue);
                    createArray1(selectedValue);
                    //Append text
                    if (settings.AppendText) {
                        textAppend(selectedValue);
                    }
                });
            }

            //search option
            $('#' + settings.renderId + 'search').keyup(function (e) {
                var searchText = $(this).val().toLowerCase();
                var FindSearch = $(this).val();
                list = $(this).parent().parent().find(".collapseContent .dropdown-item");
                headerList = $(this).parent().parent().find(".collapseContent .header-label");
                if (searchText !== "") {
                    //to check Header Text
                    headerList.each(function (i, obj) {
                        var headerName = $(this).text().toLowerCase();
                        if (headerName.indexOf(searchText) > -1) {
                            $(this).parent().next().find(".dropdown-item").each(function (i, j) {
                                $(this).show();
                            })
                        } else {
                            $(this).parent().hide();
                        }
                    });
                    //to check list Text
                    list.each(function (i, obj) {
                        var dataName = $(this).find('label').text().toLowerCase();
                        if (dataName.indexOf(searchText) > -1) {
                            $(this).show();
                            $(this).parent().prev().show();
                        } else {
                            $(this).hide();
                        }
                    });
                    //to Extra check
                    var arrayList = settings.DropDownList[0][settings.commonGroup];
                    let dropdownItemValues = arrayList.filter(item => item.value);
                    var ArrayName = dropdownItemValues.map(item => item.name);
                    if (!ArrayName.includes(FindSearch)) {
                        $('.add-option').remove();
                        $('.customDropdown-group').prepend('<a class="add-option"><span>Create ' + settings.commonGroup + ': ' + FindSearch + '</span></a>')
                        $('.add-option').on('click', function () {
                            $('.customDropdown-group').append('<a class = "dropdown-item class-' + FindSearch + '"><input id = "checkbox' + FindSearch + settings.renderId + '" name = "dropdown-input" type="checkbox" value = "' + FindSearch + '" /><label for = "checkbox' + FindSearch + settings.renderId + '">' + FindSearch + '</label></a>');
                            var object = {
                                "name": FindSearch,
                                "value": FindSearch,
                                "className": 'class-' + FindSearch
                            };
                            arrayList.push(object);
                            $('.add-option').remove();
                            InputCheck();
                        });
                    } else {
                        $('.add-option').remove();
                    }
                } else {
                    $('.add-option').remove();
                    list.each(function (i, obj) {
                        $(this).show();
                    });
                    headerList.each(function (i, obj) {
                        $(this).parent().show();
                        $(this).parent().find("input").show();
                    });
                }
                e.stopPropagation();
            });

            function removeSelected() {
                $('.select-close-icon').on("click", function (event) {
                    var removeVal = $(this).attr('title');
                    $(renderDropdown + ' .dropdown-item input[value=' + removeVal + ']').prop('checked', false);
                    $(renderDropdown + ' .dropdown-item input[value=' + removeVal + ']').parent().removeClass('checkedList');
                    selectedValue = [];
                    createArray(selectedValue);
                    createArray1(selectedValue);
                    textAppend(selectedValue);
                    event.stopPropagation();
                });
            }

            //creating array
            function createArray(selectedValue) {
                var selectedArray = [];
                $.each($(renderDropdown + ' .dropdown-item input:checked'), function () {
                    var text = $(this).next('label').text();
                    var value = $(this).val();
                    var customAppend = ('<span class = "append-text"><span class = "appendText" value = "' + value + '">' + text + '</span><a href = "javascript:void(0)" class = "select-close-icon" title = "' + value + '"><svg width="15" height="15" viewBox="2.5 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#F96258"/><path d="M6 14L14 6" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M6 6L14 14" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg></a></span>');
                    selectedArray.push(value);
                    if (settings.closeIcon) {
                        selectedValue.push(customAppend);
                    } else {
                        selectedValue.push(text);
                    }
                });
                $('#' + settings.renderId).val(selectedArray);
                return selectedValue;
            }

            //change array as per onchange data required by client
            function createArray1(selectedValue) {
                var SplitedValue = {};
                var SplitedIds = {};
                $.each($(renderDropdown + ' .dropdown-item input:checked'), function () {
                    var text = $(this).next('label').text();
                    var value = $(this).val();
                    var parentDiv = $(this).parent().parent().prev().find('.header-label').text();
                    if (Object.keys(SplitedValue).includes(parentDiv)) {
                        SplitedValue = {
                            ...SplitedValue,
                            [parentDiv]: [...SplitedValue[parentDiv], text],
                        }
                    } else {
                        SplitedValue[parentDiv] = [text];
                    }

                    if (Object.keys(SplitedIds).includes(parentDiv)) {
                        SplitedIds = {
                            ...SplitedIds,
                            [parentDiv]: [...SplitedIds[parentDiv], value],
                        }
                    } else {
                        SplitedIds[parentDiv] = [value];
                    }
                });
                if (SplitedValue && SplitedIds) {
                    //call the custom function here
                    settings.onSelectFunction(SplitedValue, SplitedIds);
                }
            }

            function textAppend(data) {
                if (data.length == 0) {
                    $('.' + settings.parentClass + ' .multiselect-btn').html("");
                } else if (data.length > settings.AppendLimit) {
                    $('.' + settings.parentClass + ' .multiselect-btn').html('<span class = "append-text">' + data.length + ' ' + settings.AppendLimitText + '</span>');
                } else {
                    $('.' + settings.parentClass + ' .multiselect-btn').html(data);
                    //remove selected
                    removeSelected();
                }
                //add class to label
                if (!data.length == 0) {
                    if (settings.inputType == "checkbox") {
                        $('.' + settings.parentClass + ' .category-label').addClass('has-value');
                    } else {
                        $('.' + settings.parentClass + ' .category-label').hide();
                    }
                } else {
                    $('.' + settings.parentClass + ' .category-label').removeClass('has-value');
                    $('.' + settings.parentClass + ' .category-label').show();
                }
                return data;
            }

            //add checked custom-class
            function AddCheck() {
                $.each($(renderDropdown + ' .dropdown-item'), function () {
                    if ($(this).find('input').is(":checked")) {
                        $(this).addClass('checkedList');
                    } else {
                        $(this).removeClass('checkedList');
                    }
                });

            }

            //on change input
            $(renderDropdown + ' .collapseContent input').on("change", function () {
                var selectedValue = settings.selectedArray;
                selectedValue = [];
                createArray(selectedValue);
                //createArray1(selectedValue);
                //Append text
                if (settings.AppendText) {
                    textAppend(selectedValue);
                }
            });
            //on add class while input checked while onchange
            $(renderDropdown + ' .dropdown-item input').on("change", function () {
                AddCheck()
            });

            //add dynamic input select
            function defaultSelectFunction(arr) {
                $.each(arr, function (i, j) {
                    var checkvalue;
                    if ($.isNumeric(j)) {
                        checkvalue = j.toString();
                    } else {
                        checkvalue = j;
                    }
                    $.each($(renderDropdown + ' .dropdown-item'), function () {
                        var currentInput = $(this).find('input');
                        var value = currentInput.val();
                        if (value === checkvalue) {
                            currentInput.prop('checked', true);
                        }
                    })
                });
                AddCheck();
                var selectedValue = settings.selectedArray;
                createArray(selectedValue);
                //Append text
                if (settings.AppendText) {
                    textAppend(selectedValue);
                }
            }

            return {
                removeSelectAllFunction: function (removeAll, deleteVal) {
                    if (removeAll) {
                        $.each($(renderDropdown + ' .dropdown-item'), function () {
                            var currentInput = $(this).find('input');
                            currentInput.prop('checked', false);
                        });
                    } else {
                        $.each($(renderDropdown + ' .dropdown-item'), function () {
                            var text = $(this).children('label').text();
                            var currentInput = $(this).find('input');
                            if (text === deleteVal) {
                                currentInput.prop('checked', false);
                            }
                        });
                    }
                    AddCheck();
                    var selectedValue = [];
                    createArray(selectedValue);
                    createArray1(selectedValue);
                    //Append text
                    if (settings.AppendText) {
                        textAppend(selectedValue);
                    }
                }
            }
        };
    }(jQuery));
})