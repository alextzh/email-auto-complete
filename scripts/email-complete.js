/**
 * 邮箱后缀补全输入
 * 2016/9/12
 * author:asteryk
 * @param 
 * autocomplete:BOOLEN,
 	可选,是否开启鼠标移动方向键移动自动补全
 * url: STRING,
	可选,ajax的url地址
 * data: OBJECT,
 *  穿参格式
    ['yeah.net','vip.163.com','vip.126.com']
    url优先于data
 * callback: FUNCTION
    回调函数，返回选中的对象
    格式{key:,value:}
 */
(function($) {
    /*
        数据处理方法  
    */
    // 数据来源分类
    function filterData(currentInput, config, $emailComplete) {
        var defer = $.Deferred();
        if (config.url) {
            $.ajax({
                type: "GET",
                url: config.url,
                data: { keyword: currentInput },
                dataType: "json",
                success: function(data) {
                    defer.resolve(associateData(currentInput, data));
                },
                error: function() {
                    console.log('获取补全信息失败');
                }
            });
        } else {
            defer.resolve(associateData(currentInput, config.data));
        };
        return defer;
    }
    // 数据联想模块
    function associateData(keyword, data, valueName) {
        var list = [];
        if (keyword == null || keyword == "") {
            return;
        }
        if (data != null && $.isArray(data)) {
            if (keyword.indexOf('@') < 0) {
                for (var i = 0; i < data.length; i++) {
                    list.push({ id: i, value: keyword + '@' + data[i] });
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].indexOf(keyword.split('@')[1]) > -1) {
                        list.push({ id: i, value: keyword.split('@')[0] + '@' + data[i] });
                    }
                }
            }
        }
        return list;
    }
    // 回调
    function callbackConstruct(config, $emailComplete) {
        var $choose = $emailComplete.find('.js-emailcomplete-selected');
        if ($choose.length <= 0) return;
        var item = {
            'id': $choose.attr('item-key'),
            'value': $choose.text()
        }
        config.callback(item);
        $emailComplete.hide();
    }
    // 自动补全
    function emailCompleteContent($inputEle, content, flag) {
        if (flag) {
            $inputEle.val(content);
        }
    }
    /*
       页面DOM方法  
    */
    // 显示下拉补全
    function resultShow(data, $emailComplete, config) {
        // [data]'s type array
        if (data == null || data.length <= 0) {
            return;
        }
        var container = '<div class="js-emailcontainer">';;
        for (var ii = 0; ii < data.length; ii++) {
            container += '<div class="js-autorow" item-key="' + data[ii].id + '">' + data[ii].value + '</div>'
        }
        container += '</div>';
        $emailComplete.html(container);
        $emailComplete.show();
    }
    // 滚动条
    function scrollHeight($outer, $input, $select, direction) {

        var inputPosition = $input.offset().top + $input.height();
        var selectPosition = $select.offset().top - inputPosition + $select.height();
        var scrollTimes = Math.floor($outer[0].scrollHeight / $outer.height());
        if (direction === 'down') {
            if (selectPosition > $outer.height()) {

                $outer.scrollTop($outer[0].scrollTop + $select.height() * scrollTimes);
            }
        } else {
            if (selectPosition < 0) {

                $outer.scrollTop($outer[0].scrollTop - $select.height() * scrollTimes);
            }
        }

    }
    // 功能键作用
    function functionKeyUse($inputEle, inputText, $emailComplete, config) {
        if ($emailComplete.is(':hidden')) return;

        switch (event.keyCode) {
            case 40: //向下键
                var $next = $emailComplete.find('.js-emailcomplete-selected');

                if ($next.length <= 0) { //没有选中行时，选中第一行
                    $next = $emailComplete.find('.js-autorow:first');
                    $emailComplete.scrollTop(0);
                } else {
                    $next = $next.next();
                }
                $('.js-autorow').removeClass('js-emailcomplete-selected');

                if ($next.length > 0) { //有下一行时（不是最后一行）
                    $next.addClass("js-emailcomplete-selected"); //选中的行加背景
                    emailCompleteContent($inputEle, $next.text(), config.autocomplete); //选中行内容设置到输入框中
                    scrollHeight($emailComplete, $inputEle, $next, 'down');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 38: //向上键
                var $previous = $emailComplete.find('.js-emailcomplete-selected');
                if ($previous.length <= 0) { //没有选中行时，选中最后一行行
                    $previous = $emailComplete.find('.js-autorow:last');
                    $emailComplete.scrollTop($emailComplete[0].scrollHeight);
                } else {
                    $previous = $previous.prev();
                }
                $('.js-autorow').removeClass('js-emailcomplete-selected');

                if ($previous.length > 0) { //有上一行时（不是第一行）
                    $previous.addClass("js-emailcomplete-selected"); //选中的行加背景
                    emailCompleteContent($inputEle, $previous.text(), config.autocomplete); //选中行内容设置到输入框中
                    scrollHeight($emailComplete, $inputEle, $previous, 'up');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 13: //回车隐藏下拉框
                var $choose = $emailComplete.find('.js-emailcomplete-selected');
                emailCompleteContent($inputEle, $choose.text(), !config.autocomplete); //选中行内容设置到输入框中
                callbackConstruct(config, $emailComplete);
            case 27: //ESC键隐藏下拉框
                $emailComplete.hide();
                break;
        }
    }
    $.fn.extend({
        emailComplete: function(params) {
            // 设置补足框位置
            var $inputEle = $(this);
            var inputWidth = $inputEle.outerWidth();
            var inputHeight = $inputEle.outerHeight();
            var inputTop = $inputEle.offset().top;
            var inputLeft = $inputEle.offset().left;
            // 配置参数
            var config = {
                autocomplete: true,
                // 可选，是否开启鼠标移动方向键移动自动补全
                url: null,
                // 可选,ajax的method
                data: null,
                // 穿参格式[
                //     ['yeah.net','vip.163.com','vip.126.com']
                // ]
                // url优先于data
                callback: null
            };
            $.extend(config, params);

            //键盘上功能键键值数组
            var functionalKeyArray = [40, 38, 13, 27];

            // 补全框设定
            var $emailComplete = $('<div class="js-emailcomplete-area"></div>');
            $(document.body).append($emailComplete);
            $emailComplete.css({
                'width': inputWidth - 2,
                'top': inputHeight + inputTop,
                'left': inputLeft
            });

            // 输入框事件，适配IE8
            $inputEle.on('input propertychange', function() {
                var currentInput = String($inputEle.val());
                $emailComplete.hide();
                filterData(currentInput, config, $emailComplete).then(function(list) {
                    resultShow(list, $emailComplete, config);
                }, function(params) {
                    console.log(params);
                });
            });
            //按下的键是否是功能键
            var isFunctionalKey = false;
            $inputEle.on('keyup', function(event) {
                event.preventDefault();
                var currentInput = String($inputEle.val());
                var keyCode = event.keyCode;
                for (var i = 0; i < functionalKeyArray.length; i++) {
                    if (keyCode == functionalKeyArray[i]) {
                        isFunctionalKey = true;
                        break;
                    }
                }
                if (isFunctionalKey) {
                    functionKeyUse($inputEle, currentInput, $emailComplete, config);
                }

            })

            // 鼠标事件
            $emailComplete.on('mouseover', '.js-autorow', function() {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $inputEle.focus();
                    $('.js-autorow').removeClass('js-emailcomplete-selected');
                    $emailCompleteRow = $(this);
                    emailCompleteContent($inputEle, $emailCompleteRow.text(), config.autocomplete);
                    $emailCompleteRow.addClass('js-emailcomplete-selected');
                }


            });
            // 点击事件，排除输入框，在空白处点击可以选中
            $(document).on('mousedown.autocomplete', function(event) {
                if (!$emailComplete.is(':hidden') && event.target.tagName != 'INPUT') {
                    $emailCompleteRow = $(this).find('.js-emailcomplete-selected');
                    emailCompleteContent($inputEle, $emailCompleteRow.text(), !config.autocomplete);
                    callbackConstruct(config, $emailComplete);
                }
            });
            // 销毁函数
            $inputEle.destory = function() {
                $(document).off('mousedown.autocomplete');
                $emailComplete.off('mouseover');
                $inputEle.off('input propertychange keyup');
                $inputEle.remove();
                $emailComplete.remove();
            };
        }

    });

})(jQuery || $);