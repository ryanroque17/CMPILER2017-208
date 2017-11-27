var antlr4 = require('antlr4/index');
var QwertyLexer = require('../generated-parser/QwertyLexer');
var QwertyParser = require('../generated-parser/QwertyParser');
var QwertyListener = require('../generated-parser/QwertyListener').QwertyListener;
var SymbolTable = require("/node_modules/symbol-table/stack");
var s = SymbolTable();
var functionTable = SymbolTable();
var QwertyValue = require('/scripts/QwertyValue');
var QwertyFunction	 = require('/scripts/QwertyFunction');

var IdentifierHandler = require('/scripts/IdentifierHandler');

var identifierHandler = new IdentifierHandler();
var consoleBox = document.getElementById("consoleBox");

var lastPrint;

AssignmentListener = function(res) {
	this.Res = res;
    QwertyListener.call(this);
    return this;
};
var assignmentListener = new AssignmentListener();

// inherit default listener
AssignmentListener.prototype = Object.create(QwertyListener.prototype);
AssignmentListener.prototype.constructor = AssignmentListener;

exports.AssignmentListener = AssignmentListener;

// Enter a parse tree produced by QwertyParser#program.
AssignmentListener.prototype.enterProgram = function(ctx) {
	s.push();
	functionTable.push();
};

// Exit a parse tree produced by QwertyParser#program.
AssignmentListener.prototype.exitProgram = function(ctx) {
};



// Enter a parse tree produced by QwertyParser#var_decl.
AssignmentListener.prototype.enterVar_decl = function(ctx) {
	// int, string, etc
	var typeName = ctx.data_type().start.text;
	// variable name
	var varName = ctx.var_identifier_list().start.text;
	console.log("VAR NAME" + varName);
	// variable value
	if(ctx.getChild(1).getChildCount() == 1){ // ex. int i;
		var varValue = new QwertyValue(typeName, "null");
	}
	else{	// ex. int i = 1;		
		var input = identifierHandler.convertVarToVal(ctx.var_identifier_list().getChild(1).getChild(1).getText(), s);	
		//console.log("input " + input);
		//console.log("typeofinput" + typeof(input));
		var varValue = new QwertyValue(typeName, input);
		/*if(!isValidAssignment(typeName, input)) {
			var errorHtml = "<tr><td>Type Check Error<td></td><td>" + varName + "</td><td>Change var type or change value.</td></tr>";
				consoleBox.innerHTML += errorHtml;
		}*/
	}
	
	if(s.has(varName)) {
		console.log("variable " + varName + " already in stack");
		var errorHtml = "<tr><td>Variable Already In Stack<td></td><td>" + varName + "</td><td>Change variable name.</td></tr>";
		consoleBox.innerHTML += errorHtml;
	} else {		
		s.set(varName, varValue);
		//console.log("value and data type of " +varName+ ":" + s.get(varName).getValue() + " & " + typeof s.get(varName).getValue());
	}
};

// Enter a parse tree produced by QwertyParser#const_statement.
AssignmentListener.prototype.enterConst_statement = function(ctx) {
	// int, string, etc
	// variable name
	var typeName = "constant";
	var varName = ctx.VARIABLE_IDENTIFIER().getText();
	var value = ctx.var_assignment_statement().getText().split('=')[1];
			
	var varValue = new QwertyValue(typeName, value);
	
	if(s.has(varName)) {
		console.log("variable " + varName + " already in stack");
		var errorHtml = "<tr><td>Variable Already In Stack<td></td><td>" + varName + "</td><td>Change variable name.</td></tr>";
		consoleBox.innerHTML += errorHtml;
	} else {		
		s.set(varName, varValue);
		//console.log("value and data type of " +varName+ ":" + s.get(varName).getValue() + " & " + typeof s.get(varName).getValue());
	}
};

// Enter a parse tree produced by QwertyParser#assignment_statement.
AssignmentListener.prototype.enterAssignment_statement = function(ctx) {
	// var input = ctx.assignment_factor().getText();
	var varName = ctx.getChild(0).getText();
	var varValue;
	var heightDiff;
	var height;
	var varHeight;
	
	if(!s.has(varName)) {
		console.log("variable " + varName + " NOT in stack!");
	}else{
		if(s.get(varName).getDataType() == "constant") {
			console.log("ERROR! Cannot re-assign constant");
			var errorHtml = "<tr><td>Cannot change constant value<td></td><td>" + varName + "</td><td>Change constant to data type.</td></tr>";
			consoleBox.innerHTML += errorHtml;
		} else {
			height = s.height();
			varHeight = s.getItsHeight(varName);
			
			if(height != varHeight){
				heightDiff = height - varHeight;
				for(var i=0; i<heightDiff ;i++){
					s.pop();
				}
			}
			////console.log(ctx.getChild(ctx.getChildCount()-1).getRuleIndex() +" aaaa");
			if(ctx.getChild(1).getText() == "="){
				varValue = ctx.getChild(2).getText();
			}else if(ctx.getChild(1).getText() == "++"){
				varValue = s.get(varName).getValue() + "+1";
			}else if(ctx.getChild(1).getText() == "--"){
				varValue = s.get(varName).getValue() + "-1";
			}else if(ctx.getChild(1).getText() == "+="){
				varValue = s.get(varName).getValue() + "+" + ctx.getChild(2).getText();
			}else if(ctx.getChild(1).getText() == "-="){
				varValue = s.get(varName).getValue() + "-" + ctx.getChild(2).getText();
			}else if(ctx.getChild(1).getText() == "*="){
				varValue = s.get(varName).getValue() + "*" + ctx.getChild(2).getText();
			}else if(ctx.getChild(1).getText() == "/="){
				varValue = s.get(varName).getValue() + "/" + ctx.getChild(2).getText();
			}else if(ctx.getChild(1).getText() == "%="){
				varValue = s.get(varName).getValue() + "%" + ctx.getChild(2).getText();
			}
			varValue = identifierHandler.convertVarToVal(varValue, s);
			s.get(varName).setValue(varValue);
			//console.log(varValue);
			//varValue = rpn(yard(varValue));
			/*if(!isValidAssignment(s.get(varName).getDataType(), varValue)) {
				console.log("Type Checking Error for variable " + varName);
				var errorHtml = "<tr><td>Type Check Error<td></td><td>" + varName + "</td><td>Change var type or change value.</td></tr>";
				consoleBox.innerHTML += errorHtml;
			} else {
				s.get(varName).setValue(varValue);
			}*/

			//console.log("value and data type of " +varName+ ":" + s.get(varName).getValue() + " & " + typeof s.get(varName).getValue());
			if(height != varHeight){
				for(var i=0; i<heightDiff ;i++){
					s.push();
				}
			}
		}
	}
};



function evaluateBoolean(input) {
	var hasAnd = false;
	var arr;
	
	if(input.split("").includes("&")) {
	  arr = input.split("&&");
	  hasAnd = true;
	} else {
		arr = [input];
	}
	  
	for(var i=0; i<arr.length; i++) {
		var poe = arr[i];
		if(poe.split("").includes("=")) {
			if(poe.split("").includes("<")) {
				// <=
				var exp = arr[i].split("<=");
				if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}
				if(exp[0] <= exp[1]) {
	    
				} else {
				    return false;
				}
			} else if(poe.split("").includes(">")) {
				// >=
				var exp = arr[i].split(">=");
				if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}
				if(exp[0] >= exp[1]) {
	    
				} else {
				    return false;
				}
			} else if(poe.split("").includes("!")) {
				// >=
				var exp = arr[i].split("!=");
				if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}
				if(exp[0] != exp[1]) {
	    
				} else {
				    return false;
				}
			}else {
				var exp = arr[i].split("==");
				if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}
			    if(exp[0] == exp[1]) {
			     
			    } else {
			        return false;
			    }
			}	
		} else if(poe.split("").includes("<")) {
			// <
			var exp = arr[i].split("<");
			if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}

		    if(exp[0] < exp[1]) {
		     
		    } else {
		        return false;
		    }
		} else if(poe.split("").includes(">")) {
			// >
			var exp = arr[i].split(">");
			if(typeof(s.get(exp[0])) == "object") {
					exp[0] = s.get(exp[0]).getValue();
				}
				if(typeof(s.get(exp[1])) == "object") {
					exp[1] = s.get(exp[1]).getValue();
				}

		    if(exp[0] > exp[1]) {
		     
		    } else {
		        return false;
		    }
		}
	}
	console.log("exp[0]" + exp[0] + " exp[1]" + exp[1])
	return true;
};

var temporaryIfCodeBlocks;
var temporaryIfConditions;
// Enter a parse tree produced by QwertyParser#if_statement.
AssignmentListener.prototype.enterIf_statement = function(ctx) {
	s.push();
	var ctxChildCount = ctx.getChildCount();

	var codeBlocks = ctx.code_block();
	var conditions = ctx.conditional_factor();
	var hasTrue = false;
	
	if(codeBlocks.length>0){
		temporaryIfCodeBlocks = codeBlocks;
		temporaryIfConditions = conditions;
	}
	else{
		codeBlocks = temporaryIfCodeBlocks;
		conditions = temporaryIfConditions;
	}	
	
	for(var i=0; i<ctxChildCount;i++){
		ctx.removeLastChild();
	}
	
	for(var i=0; i<conditions.length;i++){
		if(evaluateBoolean(conditions[i].getText())){
			antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlocks[i]);
			
			hasTrue = true;
			break;
		}
	}
	
	if(codeBlocks.length != conditions.length && !hasTrue){
		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlocks[codeBlocks.length-1]);
	}
};

// Exit a parse tree produced by QwertyParser#if_statement.
AssignmentListener.prototype.exitIf_statement = function(ctx) {
	s.pop();
};

//Enter a parse tree produced by QwertyParser#code_block.
AssignmentListener.prototype.enterCode_block = function(ctx) {
	//console.log("CODE BLOC");
};

var temporaryWhileCodeBlock;
var temporaryExpression;
var holdCtx;

AssignmentListener.prototype.enterWhile_statement = function(ctx) {
	s.push();
	holdCtx = ctx;


	var codeBlock = ctx.code_block();
	var expression = ctx.conditional_factor().getText();

	if(codeBlock!=null){
		temporaryWhileCodeBlock = codeBlock;
	}
	else{
		codeBlock = temporaryWhileCodeBlock;
	}	
	console.log(codeBlock);
	console.log("Expression: " + expression);

	if(expression!=null){
		temporaryExpression = expression;
	}else{
		expression = temporaryExpression;
	}
	ctx.removeLastChild();

	while(evaluateBoolean(expression)){
		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlock);
	}
};

// Exit a parse tree produced by QwertyParser#while_statement.
AssignmentListener.prototype.exitWhile_statement = function(ctx) {
	s.pop();
};


// Enter a parse tree produced by QwertyParser#do_while_statement.
AssignmentListener.prototype.enterDo_while_statement = function(ctx) {
	s.push();
	//console.log("dowhile");
	var codeBlock = ctx.code_block();
	var codeBlockHolder = ctx.code_block();
	var expression = ctx.conditional_factor().getText();
	console.log(evaluateBoolean(expression));
	
	var childCount = ctx.getChildCount();
	
	for(var i=0; i<childCount; i++){
		ctx.removeLastChild();
	}			
	
	antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlock);
	codeBlock = codeBlockHolder;

	while(evaluateBoolean(expression)){
		console.log("ey1");
		codeBlock = codeBlockHolder;

		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlock);
	}
};

// Exit a parse tree produced by QwertyParser#do_while_statement.
AssignmentListener.prototype.exitDo_while_statement = function(ctx) {
	s.pop();
};


function forSecondExpression(input) {
  var varName = input.split("")[input.length-1];
  
  var newString = input.split(varName)[0];
  
  if(typeof(s.get(varName)) == "object") {
      varName = s.get(varName).getValue();
  }
  
  return newString + varName;
   
}

var tempAssignBlock;
var tempCodeBlock;
var tempCondition;
var tempInit;
var run = true;

// Enter a parse tree produced by QwertyParser#for_statement.
AssignmentListener.prototype.enterFor_statement = function(ctx) {
	s.push();
	console.log(ctx);

	// i = 0;
	var declBlock = ctx.var_decl();
	if(declBlock!=null){
		tempInit = declBlock;
	}else{
		declBlock = tempInit;
	}

	// i++;
	var assignBlock = ctx.assignment_statement();
	if(assignBlock!=null){
		tempAssignBlock = assignBlock;
	}else{
		assignBlock = tempAssignBlock;
	}

	// code inside loop
	var boolBlock = ctx.bool_expression();
	if(boolBlock!=null){
		tempCondition = boolBlock;
	}else{
		boolBlock = tempCondition;
	}

	// code inside loop
	var codeBlock = ctx.code_block();
	if(codeBlock!=null){
		tempCodeBlock = codeBlock;
	}else{
		codeBlock = tempCodeBlock;
	}

	antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, declBlock);

	var childCount = ctx.getChildCount();
	for(var i=0; i<childCount; i++){
		ctx.removeLastChild();
	}	

	while(evaluateBoolean(boolBlock.getText())){
		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, codeBlock);
		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, assignBlock);
	}

};

// Exit a parse tree produced by QwertyParser#for_statement.
AssignmentListener.prototype.exitFor_statement = function(ctx) {
	s.pop();
};

//Exit a parse tree produced by QwertyParser#program.
AssignmentListener.prototype.exitProgram = function(ctx) {
	s.pop();
};

// Enter a parse tree produced by QwertyParser#scan_statement.
AssignmentListener.prototype.enterScan_statement = function(ctx) {
	//console.log(ctx);
	var variable = ctx.VARIABLE_IDENTIFIER().getText();
	var message = ctx.STRING_LITERAL().getText();
	//console.log(variable);
	//console.log(message);
	message = message.split('"').join("");
	/*consoleBox.innerHTML += "<input type='text' id='" + variable + "' value='Patrick Gan'>";
	wait(7)*/
	var input = prompt(message);
	
	inputVal = identifierHandler.convertVarToVal(input, s);
	//console.log("TYPE: " + typeof(inputVal));
	s.get(variable).setValue(inputVal);
};

// Exit a parse tree produced by QwertyParser#scan_statement.
AssignmentListener.prototype.exitScan_statement = function(ctx) {
	// s.get(variable).setValue();
/*	var variable = ctx.VARIABLE_IDENTIFIER().getText();
	var input = document.getElementById(variable).value;
	s.get(variable).setValue(input);*/
};


// Enter a parse tree produced by QwertyParser#print_statement.
AssignmentListener.prototype.enterPrint_statement = function(ctx) {
	var statement = identifierHandler.evaluatePrintExpression(ctx.expression().getText(), s);
	var split = statement.split("+").join("").split('"').join("");
	lastPrint = split;
	//console.log(split);
	console.log("enter print " + split);

	var errorHtml = "<tr><td>(NOT ERROR) Print<td></td><td></td><td>" + split + "</td></tr>";
	consoleBox.innerHTML += errorHtml;
};

function compareParameters(param1, param2){
	// param 1 = the parameters of the function
	// param 2 = the parameters given during the function call
	var param1List;
	var param1Count;
	var param2List;
	var param2Count;

	var listFuncTypes = [];
	listFuncTypes.push(param1.data_type().getText());
	var current_param = param1;
	while(true) {
		if(current_param.parameters() != null) {
			listFuncTypes.push(current_param.parameters().data_type().getText());
			current_param = current_param.parameters();
		} else {
			break;
		}
	}
	console.log(listFuncTypes);

	var firstPar;

	if(typeof(param2.actual_params()) != "object")
		firstPar = param2.VARIABLE_IDENTIFIER().getText();
	else
		firstPar = param2.expression().getText();
	var restPar = param2.actual_params().getText();
	var listCallTypes = (firstPar + "," + restPar).split(",");
	console.log(listCallTypes);

	// if number of parameters does not match!
	if(listFuncTypes.length != listCallTypes.length) {
		var errorHtml = "<tr><td>Parameters number don't match!<td></td><td></td><td>Add/subtract variables.</td></tr>";
		consoleBox.innerHTML += errorHtml;
		return false;
	} else {
		for(var i=0; i<listCallTypes.length; i++) {
			var item = listCallTypes[i];
			if(typeof(s.get(item)) == "object") {
				listCallTypes[i] = s.get(item).getDataType();
			} else {
				listCallTypes[i] = String(typeof(eval(item)));
				console.log(listCallTypes[i]);
				// subject to error if there is a float
				if(listCallTypes[i] == "number") {
					listCallTypes[i] = "int";
				}
			}
		}
	}

	console.log(listCallTypes);

	// since we now know that both array have the same lengths, does not matter which we use for condition
	for(var i=0; i<listCallTypes.length; i++)
		if(listCallTypes[i] != listFuncTypes[i])
			return false;

	return true;

	// var hasNull = false;
	// if(param1 == null){
	// 	console.log("param1 is null");		
	// 	hasNull = true;
	// }else{
	// 	param1List = param1.getText().split(",");		
	// 	param1Count = param1List.length;
	// }
	// if(param2 == null){
	// 	console.log("param2 is null");
	// 	hasNull = true;
	// }else{
	// 	param2List = param2.getText().split(",");
	// 	param2Count = param2List.length;
	// }
	// console.log("param1count is " + param1Count + " param2Count is " + param2Count);
	// if(hasNull){
	// 	if(param1 == null && param2 == null){
	// 		console.log("execute");
	// 		return true;
	// 	}else{
	// 		console.log("ERROR! Parameters do not match!!");	
	// 		return false;
	// 	}
			
	// }else if(param1Count != param2Count){
	// 	console.log("ERROR! Parameters do not match!!");	
	// 	return false;
	// }else{
	// 	console.log("execute"); 
	// 	return true;
	// }
};

//Enter a parse tree produced by QwertyParser#funccall_statement.
AssignmentListener.prototype.enterFunccall_statement = function(ctx) {
	var functionName = ctx.FUNCTION_IDENTIFIER().getText();
	var isValidParams;
	var calledFunction = functionTable.get(functionName);
	var funcCallParams;
	
	if(ctx.actual_parameter_list()!=null){
		console.log("YOO")
		funcCallParams = ctx.actual_parameter_list().actual_params();
	}else
		console.log("ZZ");

	if(calledFunction.getParameter()!=null){
		isValidParams = compareParameters(calledFunction.getParameter(), funcCallParams)
	} else
		isValidParams = compareParameters(null, funcCallParams)
		
	if(isValidParams)
		antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, calledFunction.getCodeBlock());
};

//Enter a parse tree produced by QwertyParser#function_declaration.
AssignmentListener.prototype.enterFunction_declaration = function(ctx) {
	var dataType = ctx.getChild(0).getChild(0).getText();
	var functionName = ctx.getChild(0).getChild(1).getText();
	var parameters = ctx.getChild(0).function_block().parameters();
	var functionCodeBlock = ctx.getChild(0).function_block().code_block();
	
	ctx.removeLastChild();
	//console.log(functionName);
	functionTable.set(functionName, new QwertyFunction(dataType, parameters, functionCodeBlock))
};

// Exit a parse tree produced by QwertyParser#function_declaration.
AssignmentListener.prototype.exitFunction_declaration = function(ctx) {
};